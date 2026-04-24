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
        Commands\TestMaintenanceNotifications::class,
    ];

    /**
     * Planification des tâches automatiques.
     *
     * IMPORTANT : Pour le "Silent Backend" en production, deux processus sont REQUIS :
     * 1. Le Scheduler (Cron Job) :
     *    * * * * * cd /path/to/sakan/backend && php artisan schedule:run >> /dev/null 2>&1
     * 2. Le Queue Worker (Supervisor) - Obligatoire pour WebSockets/Reverb :
     *    php artisan queue:work --queue=default --sleep=3 --tries=3
     * 
     * En développement local, lancez ces deux commandes dans des terminaux séparés :
     * - php artisan schedule:work
     * - php artisan queue:work
     */
    protected function schedule(Schedule $schedule): void
    {
        // 1er de chaque mois à minuit — génération des charges mensuelles
        $schedule->command('charges:generate')
            ->monthlyOn(1, '00:00')
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/scheduler.log'));

        // Toutes les minutes — vérification des alertes et notifications
        $schedule->command('notifications:generate')
            ->everyMinute()
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