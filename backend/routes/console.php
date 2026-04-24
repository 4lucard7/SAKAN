<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ────────────────────────────────────────────────────────
// Scheduled Tasks (Laravel 12 — schedule lives here)
// ────────────────────────────────────────────────────────

// 1er de chaque mois à minuit — génération des charges mensuelles
Schedule::command('charges:generate')
    ->monthlyOn(1, '00:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scheduler.log'));

// Deux fois par jour (08h00 et 20h00) — vérification des échéances et alertes
Schedule::command('notifications:generate')
    ->twiceDaily(8, 20)
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scheduler.log'));

