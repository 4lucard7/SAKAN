<?php

namespace App\Console\Commands;

use App\Models\Charge;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyCharges extends Command
{
    /**
     * Lance manuellement : php artisan charges:generate
     * Planifié automatiquement : le 1er de chaque mois à 00:00
     */
    protected $signature   = 'charges:generate
                                {--mois= : Mois cible (1-12), défaut = mois courant}
                                {--annee= : Année cible, défaut = année courante}';

    protected $description = 'Génère les occurrences mensuelles de toutes les charges fixes actives.';

    public function handle(): int
    {
        $now   = Carbon::now();
        $mois  = (int) ($this->option('mois')  ?? $now->month);
        $annee = (int) ($this->option('annee') ?? $now->year);

        $this->info("Génération des charges pour {$mois}/{$annee}...");

        $users = User::all();
        $totalCrees = 0;

        foreach ($users as $user) {
            // Récupère les modèles de charges actifs et DISTINCTS (libelle+montant+jour)
            // On prend la charge la plus récente par libellé pour éviter les doublons
            // si l'utilisateur a plusieurs entrées avec le même libellé.
            $modeles = $user->charges()
                ->where('actif', true)
                ->orderByDesc('id')
                ->get()
                ->unique(fn($c) => $c->libelle . '|' . $c->montant . '|' . $c->jour_echeance);

            foreach ($modeles as $modele) {
                // Vérifie si une occurrence existe déjà pour ce mois/année/libellé
                $dejaExiste = $user->charges()
                    ->where('libelle', $modele->libelle)
                    ->where('montant', $modele->montant)
                    ->where('jour_echeance', $modele->jour_echeance)
                    ->where('mois', $mois)
                    ->where('annee', $annee)
                    ->exists();

                if ($dejaExiste) {
                    $this->line("  → [SKIP] {$modele->libelle} — déjà générée.");
                    continue;
                }

                Charge::create([
                    'user_id'       => $user->id,
                    'libelle'       => $modele->libelle,
                    'categorie'     => $modele->categorie,
                    'montant'       => $modele->montant,
                    'jour_echeance' => $modele->jour_echeance,
                    'mois'          => $mois,
                    'annee'         => $annee,
                    'statut'        => 'en_attente',
                    'actif'         => true,
                    'date_paiement' => null,
                ]);

                $totalCrees++;
                $this->line("  ✓ {$modele->libelle} ({$modele->montant} MAD) créée.");
            }

            // Notification de confirmation scheduler
            if ($modeles->count() > 0) {
                Notification::create([
                    'user_id'        => $user->id,
                    'type'           => 'charges',
                    'message'        => "{$modeles->count()} charge(s) fixe(s) générée(s) pour " . Carbon::create($annee, $mois)->translatedFormat('F Y') . '.',
                    'is_read'        => false,
                    'reference_type' => null,
                    'reference_id'   => null,
                ]);
            }
        }

        $this->info("Terminé. {$totalCrees} charge(s) créée(s).");

        return Command::SUCCESS;
    }
}