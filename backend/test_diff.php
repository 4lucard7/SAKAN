<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$today = \Carbon\Carbon::today(config('app.timezone'));
$voiture = \App\Models\Voiture::first();

if (!$voiture) {
    echo "No voiture found\n";
    exit;
}

$expiryDate = \Carbon\Carbon::parse($voiture->assurance_expiry)->startOfDay();
$joursRestants = $today->diffInDays($expiryDate, false);

echo "Today: " . $today->toDateTimeString() . "\n";
echo "Expiry: " . $expiryDate->toDateTimeString() . "\n";
echo "Jours restants: " . $joursRestants . "\n";

