<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Définition du scheduler Laravel.
     *
     * Pour activer le scheduler en production, ajouter cette ligne à crontab :
     *   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
     */
    protected function schedule(Schedule $schedule): void
    {
        // Génération des charges fixes : le 1er de chaque mois à 00h05
        $schedule->command('charges:generate-monthly')
            ->monthlyOn(1, '00:05')
            ->withoutOverlapping()
            ->runInBackground();

        // Génération des notifications d'alerte : chaque jour à 08h00
        $schedule->command('notifications:generate')
            ->dailyAt('08:00')
            ->withoutOverlapping()
            ->runInBackground();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
