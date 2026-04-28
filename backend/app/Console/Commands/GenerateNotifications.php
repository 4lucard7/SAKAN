<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateNotifications extends Command
{
    /**
     * Lance manuellement : php artisan notifications:generate
     * Planifié automatiquement : deux fois par jour (08:00 et 20:00)
     */
    protected $signature   = 'notifications:generate';
    protected $description = 'Génère les notifications proactives pour tous les utilisateurs (échéances, alertes véhicule, charges en retard).';

    /**
     * Reminder tiers: 3 days before, 1 day before, same day, overdue.
     */
    private const REMINDER_TIERS = [
        ['days' => 3, 'tier' => '3_days'],
        ['days' => 1, 'tier' => '1_day'],
        ['days' => 0, 'tier' => 'same_day'],
    ];

    public function handle(): int
    {
        $today = Carbon::today(config('app.timezone'));
        $total = 0;

        Log::channel('notifications')->info('=== Début génération notifications — ' . $today->toDateString() . ' ===');
        $this->info('Génération des notifications — ' . $today->toDateString());

        foreach (User::all() as $user) {
            $count = 0;

            try {
                $count += $this->processDebts($user, $today);
                $count += $this->processCharges($user, $today);
                $count += $this->processVehicleDocs($user, $today);
                $count += $this->processMaintenances($user, $today);
            } catch (\Throwable $e) {
                Log::channel('notifications')->error("Erreur pour user #{$user->id} ({$user->email}): {$e->getMessage()}", [
                    'trace' => $e->getTraceAsString(),
                ]);
                $this->error("  ✗ {$user->email} — Erreur: {$e->getMessage()}");
                continue;
            }

            $total += $count;
            if ($count > 0) {
                $this->line("  ✓ {$user->email} — {$count} notification(s) créée(s).");
                Log::channel('notifications')->info("User #{$user->id} ({$user->email}): {$count} notification(s) créée(s).");
            }
        }

        $this->info("Terminé. {$total} notification(s) générée(s) au total.");
        Log::channel('notifications')->info("=== Terminé. {$total} notification(s) générée(s). ===");

        return Command::SUCCESS;
    }

    // ────────────────────────────────────────────────────────
    // 1. DETTES — tiered reminders (J-3, J-1, J-0) + overdue
    // ────────────────────────────────────────────────────────
    private function processDebts(User $user, Carbon $today): int
    {
        $count = 0;

        $dettes = $user->debts()
            ->whereNotNull('due_date')
            ->whereRaw("reste > 0")
            ->get();

        foreach ($dettes as $dette) {
            $dueDate = Carbon::parse($dette->due_date)->startOfDay();
            $joursRestants = (int) $today->diffInDays($dueDate, false);

            // Overdue
            if ($joursRestants < 0) {
                $tier = 'overdue';
                if ($this->notifExiste($user->id, 'finances', $dette->id, 'debt_overdue', $tier)) {
                    continue;
                }

                $label = $dette->type === 'outflow' ? 'dette envers' : 'créance de';
                $msg = "Alerte : votre {$label} {$dette->tier->name} de {$dette->reste} MAD est EN RETARD depuis le {$dueDate->format('d/m/Y')}.";

                if ($this->createNotification($user->id, 'finances', $msg, 'debt_overdue', $dette->id, $tier, $dette->is_required ?? false)) {
                    $count++;
                }
                continue;
            }

            // Tiered reminders (3 days, 1 day, same day)
            foreach (self::REMINDER_TIERS as $reminder) {
                if ($joursRestants === $reminder['days']) {
                    $tier = $reminder['tier'];
                    if ($this->notifExiste($user->id, 'finances', $dette->id, 'debt_upcoming', $tier)) {
                        continue;
                    }

                    $label = $dette->type === 'outflow' ? 'dette envers' : 'créance de';
                    $tierLabel = $this->tierLabel($reminder['days']);
                    $msg = "Rappel ({$tierLabel}) : votre {$label} {$dette->tier->name} de {$dette->reste} MAD arrive à échéance le {$dueDate->format('d/m/Y')}.";

                    if ($this->createNotification($user->id, 'finances', $msg, 'debt_upcoming', $dette->id, $tier, $dette->is_required ?? false)) {
                        $count++;
                    }
                    break; // Only one tier per entity per run
                }
            }
        }

        return $count;
    }

    // ────────────────────────────────────────────────────────
    // 2. CHARGES — overdue detection + tiered reminders
    // ────────────────────────────────────────────────────────
    private function processCharges(User $user, Carbon $today): int
    {
        $count = 0;

        $charges = $user->charges()
            ->where('statut', '!=', 'payee')
            ->get();

        foreach ($charges as $charge) {
            // Safe date creation — clamp jour_echeance to valid day for the month
            $maxDay = Carbon::create($charge->annee, $charge->mois, 1)->daysInMonth;
            $day = min((int) $charge->jour_echeance, $maxDay);
            $echeance = Carbon::create($charge->annee, $charge->mois, $day)->startOfDay();

            $joursRestants = (int) $today->diffInDays($echeance, false);

            // Overdue — update status + notify
            if ($joursRestants < 0) {
                if ($charge->statut !== 'en_retard') {
                    $charge->statut = 'en_retard';
                    $charge->saveQuietly();
                }

                if ($this->notifExiste($user->id, 'charges', $charge->id, 'charge_overdue', 'overdue')) {
                    continue;
                }

                $msg = "La charge \"{$charge->libelle}\" ({$charge->montant} MAD) est en retard depuis le {$echeance->format('d/m/Y')}.";

                if ($this->createNotification($user->id, 'charges', $msg, 'charge_overdue', $charge->id, 'overdue', $charge->is_required ?? false)) {
                    $count++;
                }
                continue;
            }

            // Tiered reminders
            foreach (self::REMINDER_TIERS as $reminder) {
                if ($joursRestants === $reminder['days']) {
                    $tier = $reminder['tier'];
                    if ($this->notifExiste($user->id, 'charges', $charge->id, 'charge_upcoming', $tier)) {
                        continue;
                    }

                    $tierLabel = $this->tierLabel($reminder['days']);
                    $msg = "Rappel ({$tierLabel}) : la charge \"{$charge->libelle}\" ({$charge->montant} MAD) arrive à échéance le {$echeance->format('d/m/Y')}.";

                    if ($this->createNotification($user->id, 'charges', $msg, 'charge_upcoming', $charge->id, $tier, $charge->is_required ?? false)) {
                        $count++;
                    }
                    break;
                }
            }
        }

        return $count;
    }

    // ────────────────────────────────────────────────────────
    // 3. VÉHICULE — document expiry (J-30, J-7, J-3, J-1, J-0)
    // ────────────────────────────────────────────────────────
    private function processVehicleDocs(User $user, Carbon $today): int
    {
        $count = 0;
        $voiture = $user->voiture;
        if (!$voiture) return 0;

        $docs = [
            'assurance'          => $voiture->assurance_expiry,
            'vignette'           => $voiture->vignette_expiry,
            'contrôle technique' => $voiture->controle_technique_expiry,
            'carte grise'        => $voiture->carte_grise_expiry,
        ];

        // Extended tiers for vehicle docs (more lead time)
        $vehicleTiers = [
            ['days' => 30, 'tier' => '30_days'],
            ['days' => 7,  'tier' => '7_days'],
            ['days' => 3,  'tier' => '3_days'],
            ['days' => 1,  'tier' => '1_day'],
            ['days' => 0,  'tier' => 'same_day'],
        ];

        foreach ($docs as $label => $expiry) {
            if (!$expiry) continue;

            $expiryDate    = Carbon::parse($expiry)->startOfDay();
            $joursRestants = (int) $today->diffInDays($expiryDate, false);

            // Overdue
            if ($joursRestants < 0) {
                $refType = "voiture_{$label}_overdue";
                if ($this->notifExiste($user->id, 'responsabilite', $voiture->id, $refType, 'overdue')) {
                    continue;
                }

                $msg = "Alerte : Votre {$label} a EXPIRÉ le {$expiryDate->format('d/m/Y')} !";
                if ($this->createNotification($user->id, 'responsabilite', $msg, $refType, $voiture->id, 'overdue', true)) {
                    $count++;
                }
                continue;
            }

            // Tiered reminders
            foreach ($vehicleTiers as $reminder) {
                if ($joursRestants === $reminder['days']) {
                    $refType = "voiture_{$label}_upcoming";
                    $tier = $reminder['tier'];

                    if ($this->notifExiste($user->id, 'responsabilite', $voiture->id, $refType, $tier)) {
                        continue;
                    }

                    $tierLabel = $this->tierLabel($reminder['days']);
                    $msg = "Rappel ({$tierLabel}) : Votre {$label} expire le {$expiryDate->format('d/m/Y')}. Pensez à le renouveler.";

                    if ($this->createNotification($user->id, 'responsabilite', $msg, $refType, $voiture->id, $tier, $joursRestants <= 7)) {
                        $count++;
                    }
                    break;
                }
            }
        }

        return $count;
    }

    // ────────────────────────────────────────────────────────
    // 4. MAINTENANCES — date-based (J-14, J-3, J-1, J-0) + km-based
    // ────────────────────────────────────────────────────────
    private function processMaintenances(User $user, Carbon $today): int
    {
        $count = 0;
        $voiture = $user->voiture;
        if (!$voiture) return 0;

        $maintenanceTiers = [
            ['days' => 14, 'tier' => '14_days'],
            ['days' => 3,  'tier' => '3_days'],
            ['days' => 1,  'tier' => '1_day'],
            ['days' => 0,  'tier' => 'same_day'],
        ];

        foreach ($voiture->maintenances as $m) {
            // ── Date-based alerts ──
            if ($m->duration && $m->last_change_date) {
                $prochaineDate = Carbon::parse($m->last_change_date)->addMonths((int) $m->duration)->startOfDay();
                $joursRestants = (int) $today->diffInDays($prochaineDate, false);

                // Overdue
                if ($joursRestants < 0) {
                    if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'maintenance_date_overdue', 'overdue')) {
                        $msg = "Alerte : L'entretien \"{$m->part_name}\" est en RETARD (prévu le {$prochaineDate->format('d/m/Y')}).";
                        if ($this->createNotification($user->id, 'maintenance', $msg, 'maintenance_date_overdue', $m->id, 'overdue', $m->is_required ?? false)) {
                            $count++;
                        }
                    }
                } else {
                    // Tiered reminders
                    foreach ($maintenanceTiers as $reminder) {
                        if ($joursRestants === $reminder['days']) {
                            $tier = $reminder['tier'];
                            if (!$this->notifExiste($user->id, 'maintenance', $m->id, 'maintenance_date_upcoming', $tier)) {
                                $tierLabel = $this->tierLabel($reminder['days']);
                                $msg = "Rappel ({$tierLabel}) : Entretien \"{$m->part_name}\" prévu le {$prochaineDate->format('d/m/Y')}. Pensez à planifier l'intervention.";
                                if ($this->createNotification($user->id, 'maintenance', $msg, 'maintenance_date_upcoming', $m->id, $tier, $m->is_required ?? false)) {
                                    $count++;
                                }
                            }
                            break;
                        }
                    }
                }
            }

            // ── Km-based alerts ──
            if ($m->limit_km && $m->kilometrage_actuel) {
                $prochaineKm = $m->kilometrage_actuel + $m->limit_km;
                $kmRestants  = $prochaineKm - $voiture->current_km;

                if ($kmRestants <= 500) {
                    $statusType = $kmRestants < 0 ? 'maintenance_km_overdue' : 'maintenance_km_upcoming';
                    $tier = $kmRestants < 0 ? 'overdue' : 'km_warning';

                    if (!$this->notifExiste($user->id, 'maintenance', $m->id, $statusType, $tier)) {
                        $msg = $kmRestants < 0
                            ? "Alerte : L'entretien \"{$m->part_name}\" est DÉPASSÉ de " . abs($kmRestants) . " km ! (seuil : {$prochaineKm} km)."
                            : "Entretien \"{$m->part_name}\" dans {$kmRestants} km (seuil : {$prochaineKm} km).";

                        if ($this->createNotification($user->id, 'maintenance', $msg, $statusType, $m->id, $tier, $m->is_required ?? false)) {
                            $count++;
                        }
                    }
                }
            }
        }

        return $count;
    }

    // ────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────

    /**
     * Check if a notification already exists for this entity + tier.
     * Uses the composite unique index (user_id, reference_type, reference_id, reminder_tier).
     */
    private function notifExiste(int $userId, string $type, int $refId, string $refType, string $tier): bool
    {
        $exists = Notification::withTrashed()
            ->where('user_id', $userId)
            ->where('type', $type)
            ->where('reference_id', $refId)
            ->where('reference_type', $refType)
            ->where('reminder_tier', $tier)
            ->exists();

        if ($exists) {
            Log::channel('notifications')->debug("Dedup: skipped [{$refType}:{$refId}] tier={$tier} for user #{$userId}");
        }

        return $exists;
    }

    /**
     * Create a notification atomically inside a DB transaction.
     * Returns true on success, false on failure (logs the error).
     */
    private function createNotification(
        int    $userId,
        string $type,
        string $message,
        string $refType,
        int    $refId,
        string $tier,
        bool   $isRequired = false
    ): bool {
        try {
            DB::transaction(function () use ($userId, $type, $message, $refType, $refId, $tier, $isRequired) {
                Notification::create([
                    'user_id'        => $userId,
                    'type'           => $type,
                    'message'        => $message,
                    'is_read'        => false,
                    'is_required'    => $isRequired,
                    'reference_type' => $refType,
                    'reference_id'   => $refId,
                    'reminder_tier'  => $tier,
                ]);
            });

            Log::channel('notifications')->info("Created: [{$refType}:{$refId}] tier={$tier} for user #{$userId}");
            return true;
        } catch (\Illuminate\Database\QueryException $e) {
            // Unique constraint violation = duplicate, safe to ignore
            if (str_contains($e->getMessage(), 'notif_dedup_unique') || str_contains($e->getMessage(), 'Duplicate entry')) {
                Log::channel('notifications')->debug("DB Dedup caught: [{$refType}:{$refId}] tier={$tier} for user #{$userId}");
                return false;
            }
            Log::channel('notifications')->error("DB error creating notification: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Human-readable tier label for notification messages.
     */
    private function tierLabel(int $days): string
    {
        return match ($days) {
            0  => "aujourd'hui",
            1  => 'J-1',
            3  => 'J-3',
            7  => 'J-7',
            14 => 'J-14',
            30 => 'J-30',
            default => "J-{$days}",
        };
    }
}