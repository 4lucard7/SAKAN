<?php

namespace App\Console\Commands;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class TestMaintenanceNotifications extends Command
{
    protected $signature = 'notifications:test {user_id?}';
    protected $description = 'Prepare a vehicle maintenance case to trigger notification generation and run the command.';

    public function handle(): int
    {
        $userId = $this->argument('user_id');
        $user = $userId ? User::find($userId) : User::first();

        if (!$user) {
            $this->error('Aucun utilisateur trouvé.');
            return self::FAILURE;
        }

        $car = $user->voiture;
        if (!$car) {
            $car = $user->voiture()->create([
                'car_name'   => 'Voiture de test',
                'current_km' => 1000,
            ]);
            $this->info('Aucune voiture trouvée : création d\'une voiture de test.');
        }

        $today = Carbon::today();
        $currentKm = $car->current_km ?? 1000;
        if ($car->current_km === null) {
            $car->update(['current_km' => $currentKm]);
            $this->info("Initialisé current_km à {$currentKm}.");
        }

        $maintenance = $car->maintenances()->first();
        $duration = $maintenance?->duration ?: 1;
        $targetDate = Carbon::now()->addDays(14);
        $lastChangeDate = $targetDate->copy()->subMonths($duration)->toDateString();
        $limitKm = 500;
        $kilometrageActuel = max(0, $car->current_km - 100);

        if (!$maintenance) {
            $maintenance = $car->maintenances()->create([
                'part_name'         => 'Test maintenance',
                'kilometrage_actuel'=> $kilometrageActuel,
                'limit_km'          => $limitKm,
                'last_change_date'  => $lastChangeDate,
                'duration'          => $duration,
                'cout'              => 0,
                'notes'             => 'Test notification generation',
                'is_required'       => true,
            ]);
            $this->info("Création d'une maintenance de test (#{$maintenance->id}).");
        } else {
            $maintenance->update([
                'kilometrage_actuel'=> $kilometrageActuel,
                'limit_km'          => $limitKm,
                'last_change_date'  => $lastChangeDate,
                'duration'          => $duration,
                'is_required'       => true,
            ]);
            $this->info("Mise à jour de la maintenance existante (#{$maintenance->id}).");
        }

        $prochaineKm = $maintenance->kilometrage_actuel + $maintenance->limit_km;
        $prochaineDate = Carbon::parse($maintenance->last_change_date)->addMonths($maintenance->duration);
        $kmRestants = $prochaineKm - $car->current_km;
        $daysRestants = $today->diffInDays($prochaineDate, false);

        $this->info("Voiture current_km : {$car->current_km}");
        $this->info("Maintenance prochaine km : {$prochaineKm} ({$kmRestants} km restants)");
        $this->info("Maintenance prochaine date : {$prochaineDate->toDateString()} ({$daysRestants} jours restant pour la date attendue)");

        $this->line('Exécution de la commande notifications:generate...');
        Artisan::call('notifications:generate', [], $this->getOutput());

        return self::SUCCESS;
    }
}
