<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Tâche planifiée : s'exécute chaque jour.
 * Vérifie toutes les échéances et génère des notifications proactives :
 *   - Entretiens voiture J-14 (date) ou 500km du seuil
 *   - Responsabilités véhicule J-30 et J-7
 *   - Dettes/créances J-7 avant échéance
 *   - Charges en retard
 *
 * Lancer manuellement : php artisan notifications:generate
 */
class GenerateNotifications extends Command
{
    protected $signature   = 'notifications:generate';
    protected $description = 'Génère les notifications d\'alerte basées sur les échéances.';

    public function handle(): int
    {
        $today = Carbon::today();
        $this->info("Génération des notifications ({$today->toDateString()})...");

        $users = User::with(['voiture.maintenances', 'debts', 'charges'])->get();
        $total = 0;

        foreach ($users as $user) {
            $total += $this->notifierVehicule($user, $today);
            $total += $this->notifierFinances($user, $today);
            $total += $this->notifierCharges($user, $today);
        }

        $this->info("✓ {$total} notification(s) créée(s).");

        return Command::SUCCESS;
    }

    // ──────────────────────────────────────────────────────────────
    // Véhicule : responsabilités + maintenances
    // ──────────────────────────────────────────────────────────────
    private function notifierVehicule(User $user, Carbon $today): int
    {
        $count   = 0;
        $voiture = $user->voiture;

        if (!$voiture) return 0;

        // Responsabilités administratives
        $docs = [
            'assurance'          => ['expiry' => $voiture->assurance_expiry,          'label' => "l'assurance"],
            'vignette'           => ['expiry' => $voiture->vignette_expiry,           'label' => 'la vignette'],
            'controle_technique' => ['expiry' => $voiture->controle_technique_expiry, 'label' => 'le contrôle technique'],
            'carte_grise'        => ['expiry' => $voiture->carte_grise_expiry,        'label' => 'la carte grise'],
        ];

        foreach ($docs as $key => $info) {
            if (!$info['expiry']) continue;

            $daysLeft = $today->diffInDays($info['expiry'], false);

            foreach ([30, 7] as $seuil) {
                if ((int) $daysLeft === $seuil) {
                    if ($this->notifExiste($user->id, 'responsabilite', $voiture->id, "j{$seuil}_{$key}")) continue;

                    Notification::create([
                        'user_id'        => $user->id,
                        'type'           => 'responsabilite',
                        'message'        => "⚠️ {$voiture->car_name} : {$info['label']} expire dans {$seuil} jour(s) ({$info['expiry']->toDateString()}).",
                        'reference_type' => 'voiture',
                        'reference_id'   => $voiture->id,
                    ]);
                    $count++;
                }
            }
        }

        // Maintenances
        foreach ($voiture->maintenances as $m) {
            // Alerte date J-14
            if ($m->prochaine_date) {
                $daysLeft = $today->diffInDays(Carbon::parse($m->prochaine_date), false);
                if ((int) $daysLeft === 14) {
                    if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'j14_date')) {
                        Notification::create([
                            'user_id'        => $user->id,
                            'type'           => 'maintenance',
                            'message'        => "🔧 {$voiture->car_name} : {$m->part_name} à prévoir dans 14 jours (le {$m->prochaine_date}).",
                            'reference_type' => 'voiture_maintenance',
                            'reference_id'   => $m->id,
                        ]);
                        $count++;
                    }
                }
            }

            // Alerte kilométrage : 500 km du seuil
            if ($m->prochain_km && $voiture->current_km) {
                $kmRestants = $m->prochain_km - $voiture->current_km;
                if ($kmRestants > 0 && $kmRestants <= 500) {
                    if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'km500')) {
                        Notification::create([
                            'user_id'        => $user->id,
                            'type'           => 'maintenance',
                            'message'        => "🔧 {$voiture->car_name} : {$m->part_name} dans {$kmRestants} km (seuil : {$m->prochain_km} km).",
                            'reference_type' => 'voiture_maintenance',
                            'reference_id'   => $m->id,
                        ]);
                        $count++;
                    }
                }
            }
        }

        return $count;
    }

    // ──────────────────────────────────────────────────────────────
    // Finances : dettes/créances J-7
    // ──────────────────────────────────────────────────────────────
    private function notifierFinances(User $user, Carbon $today): int
    {
        $count = 0;

        foreach ($user->debts as $debt) {
            if (!$debt->due_date || $debt->statut === 'solde') continue;

            $daysLeft = $today->diffInDays($debt->due_date, false);

            if ((int) $daysLeft === 7) {
                if (!$this->notifExiste($user->id, 'finances', $debt->id, 'j7')) {
                    $typeLabel = $debt->type === 'outflow' ? 'dette' : 'créance';
                    $tier      = $debt->tier->name ?? 'inconnu';
                    Notification::create([
                        'user_id'        => $user->id,
                        'type'           => 'finances',
                        'message'        => "💰 {$typeLabel} avec {$tier} : échéance dans 7 jours ({$debt->due_date->toDateString()}). Reste : {$debt->reste} MAD.",
                        'reference_type' => 'debt',
                        'reference_id'   => $debt->id,
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }

    // ──────────────────────────────────────────────────────────────
    // Charges : passage en retard automatique
    // ──────────────────────────────────────────────────────────────
    private function notifierCharges(User $user, Carbon $today): int
    {
        $count = 0;

        foreach ($user->charges as $charge) {
            if ($charge->statut !== 'en_attente' || !$charge->mois || !$charge->annee) continue;

            $echeance = Carbon::createFromDate($charge->annee, $charge->mois, $charge->jour_echeance);

            if ($today->gt($echeance)) {
                $charge->statut = 'en_retard';
                $charge->save();

                if (!$this->notifExiste($user->id, 'charges', $charge->id, 'retard')) {
                    Notification::create([
                        'user_id'        => $user->id,
                        'type'           => 'charges',
                        'message'        => "📋 Charge en retard : {$charge->libelle} ({$charge->montant} MAD) — échéance dépassée le {$echeance->toDateString()}.",
                        'reference_type' => 'charge',
                        'reference_id'   => $charge->id,
                    ]);
                    $count++;
                }
            }
        }

        return $count;
    }

    // ──────────────────────────────────────────────────────────────
    // Anti-doublon : vérifie si une notif similaire existe déjà aujourd'hui
    // ──────────────────────────────────────────────────────────────
    private function notifExiste(int $userId, string $type, int $refId, string $tag): bool
    {
        return Notification::where('user_id', $userId)
            ->where('type', $type)
            ->where('reference_id', $refId)
            ->whereDate('created_at', Carbon::today())
            ->where('message', 'like', "%{$tag}%")
            ->exists();
    }
}
