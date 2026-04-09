<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Enregistrement des commandes Artisan personnalisées.
     */
    protected $commands = [
        Commands\GenerateMonthlyCharges::class,
        Commands\GenerateNotifications::class,
    ];

    /**
     * Planification des tâches automatiques.
     *
     * Pour activer le scheduler en production, ajouter au cron du serveur :
     *   * * * * * cd /path/to/sakan && php artisan schedule:run >> /dev/null 2>&1
     *
     * En développement, lancer : php artisan schedule:work
     */
    protected function schedule(Schedule $schedule): void
    {
        // 1er de chaque mois à minuit — génération des charges mensuelles
        $schedule->command('charges:generate')
            ->monthlyOn(1, '00:00')
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/scheduler.log'));

        // Tous les jours à 08:00 — vérification des alertes et notifications
        $schedule->command('notifications:generate')
            ->dailyAt('08:00')
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/scheduler.log'));
    }

    /**
     * Enregistrement des commandes via auto-discovery.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}