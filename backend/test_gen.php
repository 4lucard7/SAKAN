<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$today = \Carbon\Carbon::today(config('app.timezone'));
$user = \App\Models\User::first();
$voiture = $user->voiture;

$docs = [
    'assurance'          => $voiture->assurance_expiry,
    'vignette'           => $voiture->vignette_expiry,
    'contrôle technique' => $voiture->controle_technique_expiry,
    'carte grise'        => $voiture->carte_grise_expiry,
];

$vehicleTiers = [
    ['days' => 30, 'tier' => '30_days'],
    ['days' => 7,  'tier' => '7_days'],
    ['days' => 3,  'tier' => '3_days'],
    ['days' => 1,  'tier' => '1_day'],
    ['days' => 0,  'tier' => 'same_day'],
];

foreach ($docs as $label => $expiry) {
    echo "Checking $label ($expiry)...\n";
    if (!$expiry) continue;

    $expiryDate    = \Carbon\Carbon::parse($expiry)->startOfDay();
    $joursRestants = (int) $today->diffInDays($expiryDate, false);

    echo "  Jours restants: $joursRestants\n";

    // Overdue
    if ($joursRestants < 0) {
        echo "  Overdue logic\n";
        continue;
    }

    // Tiered reminders
    foreach ($vehicleTiers as $reminder) {
        if ($joursRestants === $reminder['days']) {
            $refType = "voiture_{$label}_upcoming";
            $tier = $reminder['tier'];

            echo "  Matched tier: $tier. Checking notifExiste...\n";

            $exists = \App\Models\Notification::where('user_id', $user->id)
                ->where('type', 'responsabilite')
                ->where('reference_id', $voiture->id)
                ->where('reference_type', $refType)
                ->where('reminder_tier', $tier)
                ->exists();

            if ($exists) {
                echo "  Notif already exists!\n";
                continue;
            }

            echo "  Will create notification!\n";
            break;
        }
    }
}
