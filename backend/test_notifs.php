<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (\App\Models\User::all() as $u) {
    \App\Models\Notification::create([
        'user_id' => $u->id,
        'type' => 'responsabilite',
        'message' => 'Test: Votre assurance expire dans 3 jours',
        'reference_type' => 'voiture_assurance_upcoming',
        'reference_id' => 8,
        'tier' => '3_days',
        'is_read' => false
    ]);
    \App\Models\Notification::create([
        'user_id' => $u->id,
        'type' => 'maintenance',
        'message' => 'Test: Vidange dépassée',
        'reference_type' => 'maintenance_date_overdue',
        'reference_id' => 8,
        'tier' => 'overdue',
        'is_required' => true,
        'is_read' => false
    ]);
}
echo "Notifications created successfully.\n";
