<?php

namespace App\Console\Commands;

use App\Models\Charge;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Tâche planifiée : s'exécute au 1er de chaque mois.
 * Génère les occurrences mensuelles des charges actives et
 * crée une notification de confirmation.
 *
 * Lancer manuellement : php artisan charges:generate-monthly
 */
class GenerateMonthlyCharges extends Command
{
    protected $signature   = 'charges:generate-monthly {--mois= : Mois cible (1-12, défaut = mois courant)} {--annee= : Année cible}';
    protected $description = 'Génère les occurrences mensuelles des charges fixes pour tous les utilisateurs.';

    public function handle(): int
    {
        $now  = Carbon::now();
        $mois = (int) ($this->option('mois') ?? $now->month);
        $annee = (int) ($this->option('annee') ?? $now->year);

        $this->info("Génération des charges pour {$mois}/{$annee}...");

        $users = User::all();

        foreach ($users as $user) {
            // Récupère les charges actives (modèles récurrents = actif = true, mois/annee = null ou autre mois)
            // On identifie les "modèles" en prenant les libellés uniques actifs de l'utilisateur
            $modeles = $user->charges()
                ->where('actif', true)
                ->get()
                ->unique(fn($c) => $c->libelle . '|' . $c->jour_echeance . '|' . $c->montant);

            $generes = 0;

            foreach ($modeles as $modele) {
                // Vérifie si l'occurrence n'existe pas déjà pour ce mois
                $existe = $user->charges()
                    ->where('libelle', $modele->libelle)
                    ->where('jour_echeance', $modele->jour_echeance)
                    ->where('mois', $mois)
                    ->where('annee', $annee)
                    ->exists();

                if ($existe) {
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
                ]);

                $generes++;
            }

            if ($generes > 0) {
                // Notification de confirmation
                Notification::create([
                    'user_id' => $user->id,
                    'type'    => 'charges',
                    'message' => "{$generes} charge(s) fixe(s) générée(s) pour " . Carbon::createFromDate($annee, $mois, 1)->translatedFormat('F Y') . '.',
                ]);

                $this->line("  → Utilisateur #{$user->id} : {$generes} charge(s) générée(s).");
            }
        }

        $this->info('✓ Génération terminée.');

        return Command::SUCCESS;
    }
}
