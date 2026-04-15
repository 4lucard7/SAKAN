<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateNotifications extends Command
{
    /**
     * Lance manuellement : php artisan notifications:generate
     * Planifié automatiquement : tous les jours à 08:00
     */
    protected $signature   = 'notifications:generate';
    protected $description = 'Génère les notifications proactives pour tous les utilisateurs (échéances, alertes véhicule, charges en retard).';

    public function handle(): int
    {
        $now   = Carbon::now();
        $today = Carbon::today();
        $total = 0;

        $this->info('Génération des notifications — ' . $today->toDateString());

        foreach (User::all() as $user) {
            $count = 0;

            // ────────────────────────────────────────────────────────
            // 1. DETTES — alerte J-7 avant due_date
            // ────────────────────────────────────────────────────────
            $dettes = $user->debts()
                ->whereNotNull('due_date')
                ->whereRaw("reste > 0")
                ->get();

            foreach ($dettes as $dette) {
                $joursRestants = $today->diffInDays(Carbon::parse($dette->due_date), false);

                if ($joursRestants !== 7) continue; // exactement J-7

                if ($this->notifExiste($user->id, 'finances', $dette->id, 'debt', $today)) continue;

                $label = $dette->type === 'outflow' ? 'dette envers' : 'créance de';
                Notification::create([
                    'user_id'        => $user->id,
                    'type'           => 'finances',
                    'message'        => "Rappel : votre {$label} {$dette->tier->name} de {$dette->reste} MAD arrive à échéance dans 7 jours ({$dette->due_date->format('d/m/Y')}).",
                    'is_read'        => false,
                    'is_required'    => $dette->is_required ?? false,
                    'reference_type' => 'debt',
                    'reference_id'   => $dette->id,
                ]);
                $count++;
            }

            // ────────────────────────────────────────────────────────
            // 2. CHARGES — passage en retard le lendemain du jour d'échéance
            // ────────────────────────────────────────────────────────
            $charges = $user->charges()
                ->where('mois', $now->month)
                ->where('annee', $now->year)
                ->where('statut', 'en_attente')
                ->get();

            foreach ($charges as $charge) {
                // Jour d'échéance dépassé ?
                $echeance = Carbon::create($now->year, $now->month, $charge->jour_echeance);
                if ($today->lte($echeance)) continue;

                // Met à jour le statut en base
                $charge->statut = 'en_retard';
                $charge->save();

                if ($this->notifExiste($user->id, 'charges', $charge->id, 'charge', $today)) continue;

                Notification::create([
                    'user_id'        => $user->id,
                    'type'           => 'charges',
                    'message'        => "La charge \"{$charge->libelle}\" ({$charge->montant} MAD) est en retard depuis le {$echeance->format('d/m/Y')}.",
                    'is_read'        => false,
                    'is_required'    => $charge->is_required ?? false,
                    'reference_type' => 'charge',
                    'reference_id'   => $charge->id,
                ]);
                $count++;
            }

            // ────────────────────────────────────────────────────────
            // 3. VÉHICULE — responsabilités (J-30 et J-7)
            // ────────────────────────────────────────────────────────
            $voiture = $user->voiture;

            if ($voiture) {
                $docs = [
                    'assurance'          => $voiture->assurance_expiry,
                    'vignette'           => $voiture->vignette_expiry,
                    'contrôle technique' => $voiture->controle_technique_expiry,
                    'carte grise'        => $voiture->carte_grise_expiry,
                ];

                foreach ($docs as $label => $expiry) {
                    if (!$expiry) continue;

                    $expiryDate    = Carbon::parse($expiry);
                    $joursRestants = $today->diffInDays($expiryDate, false);

                    if (!in_array($joursRestants, [30, 7])) continue;

                    $key = "responsabilite_{$label}_{$joursRestants}j";
                    if ($this->notifExisteParMessage($user->id, $key, $today)) continue;

                    Notification::create([
                        'user_id'        => $user->id,
                        'type'           => 'responsabilite',
                        'message'        => "Votre {$label} expire dans {$joursRestants} jours ({$expiryDate->format('d/m/Y')}). Pensez à le renouveler.",
                        'is_read'        => false,
                        'is_required'    => false,
                        'reference_type' => 'voiture',
                        'reference_id'   => $voiture->id,
                    ]);
                    $count++;
                }

                // ────────────────────────────────────────────────────
                // 4. MAINTENANCES — J-14 date OU 500 km du seuil
                // ────────────────────────────────────────────────────
                foreach ($voiture->maintenances as $m) {
                    // Alerte par date — J-14
                    if ($m->duration && $m->last_change_date) {
                        $prochaineDate = Carbon::parse($m->last_change_date)->addMonths($m->duration);
                        $joursRestants = $today->diffInDays($prochaineDate, false);

                        if ($joursRestants === 14) {
                            if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'maintenance_date', $today, true)) {
                                Notification::create([
                                    'user_id'        => $user->id,
                                    'type'           => 'maintenance',
                                    'message'        => "Entretien \"{$m->part_name}\" prévu dans 14 jours ({$prochaineDate->format('d/m/Y')}). Pensez à planifier l'intervention.",
                                    'is_read'        => false,
                                    'is_required'    => $m->is_required ?? false,
                                    'reference_type' => 'maintenance',
                                    'reference_id'   => $m->id,
                                ]);
                                $count++;
                            }
                        }
                    }

                    // Alerte par kilométrage — à 500 km du seuil
                    if ($m->limit_km && $m->kilometrage_actuel) {
                        $prochaineKm   = $m->kilometrage_actuel + $m->limit_km;
                        $kmRestants    = $prochaineKm - $voiture->current_km;

                        if ($kmRestants > 0 && $kmRestants <= 500) {
                            if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'maintenance_km', $today, false)) {
                                Notification::create([
                                    'user_id'        => $user->id,
                                    'type'           => 'maintenance',
                                    'message'        => "Entretien \"{$m->part_name}\" dans {$kmRestants} km (seuil : {$prochaineKm} km). Votre kilométrage actuel : {$voiture->current_km} km.",
                                    'is_read'        => false,
                                    'is_required'    => $m->is_required ?? false,
                                    'reference_type' => 'maintenance',
                                    'reference_id'   => $m->id,
                                ]);
                                $count++;
                            }
                        }
                    }
                }
            }

            $total += $count;
            if ($count > 0) {
                $this->line("  ✓ {$user->email} — {$count} notification(s) créée(s).");
            }
        }

        $this->info("Terminé. {$total} notification(s) générée(s) au total.");

        return Command::SUCCESS;
    }

    /**
     * Vérifie si une notif pour cette entité a déjà été créée aujourd'hui.
     * Empêche les doublons si la commande tourne plusieurs fois.
     */
    private function notifExiste(int $userId, string $type, int $refId, string $refType, Carbon $today, bool $sameDay = true): bool
    {
        $query = Notification::where('user_id', $userId)
            ->where('type', $type)
            ->where('reference_id', $refId)
            ->where('reference_type', $refType);

        if ($sameDay) {
            $query->whereDate('created_at', $today);
        }

        return $query->exists();
    }

    /**
     * Vérifie les doublons pour les notifs sans reference_id stable (responsabilités).
     * On cherche par un mot-clé unique dans le message.
     */
    private function notifExisteParMessage(int $userId, string $keyword, Carbon $today): bool
    {
        return Notification::where('user_id', $userId)
            ->where('message', 'like', "%{$keyword}%")
            ->whereDate('created_at', $today)
            ->exists();
    }
}