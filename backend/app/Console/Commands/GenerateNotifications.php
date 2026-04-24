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
        $now   = Carbon::now('UTC');
        $today = Carbon::today('UTC');
        $total = 0;

        $this->info('Génération des notifications — ' . $today->toDateString());

        foreach (User::all() as $user) {
            $count = 0;

            // ────────────────────────────────────────────────────────
            // 1. DETTES — alerte J-7 avant due_date ou en retard
            // ────────────────────────────────────────────────────────
            $dettes = $user->debts()
                ->whereNotNull('due_date')
                ->whereRaw("reste > 0")
                ->get();

            foreach ($dettes as $dette) {
                $joursRestants = $today->diffInDays(Carbon::parse($dette->due_date), false);

                // Si <= 7 jours (incluant les jours négatifs = en retard)
                if ($joursRestants <= 7) {
                    $statusType = $joursRestants < 0 ? 'debt_overdue' : 'debt_upcoming';
                    if ($this->notifExiste($user->id, 'finances', $dette->id, $statusType, $today, false)) continue;

                    $label = $dette->type === 'outflow' ? 'dette envers' : 'créance de';
                    $msg = $joursRestants < 0 
                        ? "Alerte : votre {$label} {$dette->tier->name} de {$dette->reste} MAD est EN RETARD depuis le {$dette->due_date->format('d/m/Y')}."
                        : "Rappel : votre {$label} {$dette->tier->name} de {$dette->reste} MAD arrive à échéance le {$dette->due_date->format('d/m/Y')}.";

                    Notification::create([
                        'user_id'        => $user->id,
                        'type'           => 'finances',
                        'message'        => $msg,
                        'is_read'        => false,
                        'is_required'    => $dette->is_required ?? false,
                        'reference_type' => $statusType,
                        'reference_id'   => $dette->id,
                    ]);
                    $count++;
                }
            }

            // ────────────────────────────────────────────────────────
            // 2. CHARGES — passage en retard le lendemain du jour d'échéance
            // ────────────────────────────────────────────────────────
            $charges = $user->charges()
                ->where('statut', '!=', 'payee')
                ->get();

            foreach ($charges as $charge) {
                $echeance = Carbon::create($charge->annee, $charge->mois, $charge->jour_echeance);
                if ($today->lte($echeance)) continue; // Pas encore en retard

                if ($charge->statut !== 'en_retard') {
                    $charge->statut = 'en_retard';
                    $charge->save();
                }

                if ($this->notifExiste($user->id, 'charges', $charge->id, 'charge_overdue', $today, false)) continue;

                Notification::create([
                    'user_id'        => $user->id,
                    'type'           => 'charges',
                    'message'        => "La charge \"{$charge->libelle}\" ({$charge->montant} MAD) est en retard depuis le {$echeance->format('d/m/Y')}.",
                    'is_read'        => false,
                    'is_required'    => $charge->is_required ?? false,
                    'reference_type' => 'charge_overdue',
                    'reference_id'   => $charge->id,
                ]);
                $count++;
            }

            // ────────────────────────────────────────────────────────
            // 3. VÉHICULE — responsabilités (J-30, J-7 ou dépassé)
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

                    if ($joursRestants <= 30) {
                        $statusType = $joursRestants < 0 ? 'overdue' : ($joursRestants <= 7 ? '7j' : '30j');
                        $refType = "voiture_{$label}_{$statusType}";
                        
                        if ($this->notifExiste($user->id, 'responsabilite', $voiture->id, $refType, $today, false)) continue;

                        $msg = $joursRestants < 0
                            ? "Alerte : Votre {$label} a EXPIRÉ le {$expiryDate->format('d/m/Y')} !"
                            : "Votre {$label} expire le {$expiryDate->format('d/m/Y')}. Pensez à le renouveler.";

                        Notification::create([
                            'user_id'        => $user->id,
                            'type'           => 'responsabilite',
                            'message'        => $msg,
                            'is_read'        => false,
                            'is_required'    => $joursRestants <= 7,
                            'reference_type' => $refType,
                            'reference_id'   => $voiture->id,
                        ]);
                        $count++;
                    }
                }

                // ────────────────────────────────────────────────────
                // 4. MAINTENANCES — J-14 date OU <= 500 km du seuil
                // ────────────────────────────────────────────────────
                foreach ($voiture->maintenances as $m) {
                    // Alerte par date — <= 14 jours
                    if ($m->duration && $m->last_change_date) {
                        $prochaineDate = Carbon::parse($m->last_change_date)->addMonths((int) $m->duration);
                        $joursRestants = $today->diffInDays($prochaineDate, false);

                        if ($joursRestants <= 14) {
                            $statusType = $joursRestants < 0 ? 'maintenance_date_overdue' : 'maintenance_date_upcoming';
                            if (!$this->notifExiste($user->id, 'maintenance', $m->id, $statusType, $today, false)) {
                                
                                $msg = $joursRestants < 0
                                    ? "Alerte : L'entretien \"{$m->part_name}\" est en RETARD (prévu le {$prochaineDate->format('d/m/Y')})."
                                    : "Entretien \"{$m->part_name}\" prévu le {$prochaineDate->format('d/m/Y')}. Pensez à planifier l'intervention.";

                                Notification::create([
                                    'user_id'        => $user->id,
                                    'type'           => 'maintenance',
                                    'message'        => $msg,
                                    'is_read'        => false,
                                    'is_required'    => $m->is_required ?? false,
                                    'reference_type' => $statusType,
                                    'reference_id'   => $m->id,
                                ]);
                                $count++;
                            }
                        }
                    }

                    // Alerte par kilométrage — <= 500 km restants
                    if ($m->limit_km && $m->kilometrage_actuel) {
                        $prochaineKm   = $m->kilometrage_actuel + $m->limit_km;
                        $kmRestants    = $prochaineKm - $voiture->current_km;

                        if ($kmRestants <= 500) {
                            $statusType = $kmRestants < 0 ? 'maintenance_km_overdue' : 'maintenance_km_upcoming';
                            if (!$this->notifExiste($user->id, 'maintenance', $m->id, $statusType, $today, false)) {
                                
                                $msg = $kmRestants < 0
                                    ? "Alerte : L'entretien \"{$m->part_name}\" est DÉPASSÉ de " . abs($kmRestants) . " km ! (seuil : {$prochaineKm} km)."
                                    : "Entretien \"{$m->part_name}\" dans {$kmRestants} km (seuil : {$prochaineKm} km).";

                                Notification::create([
                                    'user_id'        => $user->id,
                                    'type'           => 'maintenance',
                                    'message'        => $msg,
                                    'is_read'        => false,
                                    'is_required'    => $m->is_required ?? false,
                                    'reference_type' => $statusType,
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
        // On vérifie si une notification EXACTEMENT identique et NON LUE existe déjà, 
        // ou si elle a été générée récemment, pour éviter le spam infini.
        return Notification::where('user_id', $userId)
            ->where('type', $type)
            ->where('reference_id', $refId)
            ->where('reference_type', $refType)
            // Empêcher la re-création si la notification est toujours non lue
            // Ou retirer la vérification whereDate pour s'assurer que c'est le statut ("is_notified")
            ->exists();
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