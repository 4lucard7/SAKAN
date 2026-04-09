<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     * KPIs agrégés pour le tableau de bord
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $now  = Carbon::now();

        // ── Finances ────────────────────────────────────────────────
        $debts = $user->debts()->get();

        $totalDettes   = $debts->where('type', 'outflow')->sum('reste');
        $totalCreances = $debts->where('type', 'inflow')->sum('reste');
        $soldeNet      = $totalCreances - $totalDettes;

        $debtsEnRetard = $debts->filter(fn($d) => $d->statut === 'en_retard')->count();
        $debtsProches  = $debts->filter(function ($d) use ($now) {
            if (!$d->due_date || $d->statut === 'solde') return false;
            return $now->diffInDays($d->due_date, false) <= 7 && $d->due_date->gte($now);
        })->count();

        // ── Charges du mois ─────────────────────────────────────────
        $chargesMois = $user->charges()
            ->where('mois', $now->month)
            ->where('annee', $now->year)
            ->get();

        $chargesMois->each(fn($c) => $c->verifierStatut());

        $chargesTotal    = $chargesMois->sum('montant');
        $chargesPayees   = $chargesMois->where('statut', 'payee')->sum('montant');
        $chargesRestant  = $chargesMois->whereIn('statut', ['en_attente', 'en_retard'])->sum('montant');
        $chargesEnRetard = $chargesMois->where('statut', 'en_retard')->count();

        // ── Véhicule ─────────────────────────────────────────────────
        $voitureAlertes = [];
        $voiture        = $user->voiture;

        if ($voiture) {
            // Alertes responsabilités
            foreach ($voiture->responsabilites as $doc => $info) {
                if (in_array($info['statut'], ['alerte_j7', 'alerte_j30', 'expire'])) {
                    $voitureAlertes[] = [
                        'type'           => 'responsabilite',
                        'document'       => $doc,
                        'statut'         => $info['statut'],
                        'jours_restants' => $info['jours_restants'] ?? null,
                    ];
                }
            }

            // Alertes maintenances
            foreach ($voiture->maintenances as $m) {
                if (in_array($m->statut_alerte, ['alerte_km', 'alerte_date', 'depasse'])) {
                    $voitureAlertes[] = [
                        'type'         => 'maintenance',
                        'part_name'    => $m->part_name,
                        'statut'       => $m->statut_alerte,
                        'prochaine_km' => $m->prochain_km,
                        'prochaine_date' => $m->prochaine_date,
                    ];
                }
            }
        }

        // ── Notifications non lues ───────────────────────────────────
        $unreadNotifs = $user->notifications()->where('is_read', false)->count();

        // ── Graphiques (données pour charts) ─────────────────────────
        // Répartition charges par catégorie (mois courant)
        $chargesParCategorie = $chargesMois->groupBy('categorie')->map(fn($g) => [
            'categorie' => $g->first()->categorie ?? 'Non catégorisé',
            'total'     => $g->sum('montant'),
        ])->values();

        // Évolution dettes sur 6 derniers mois
        $evolutionDettes = collect(range(5, 0))->map(function ($monthsAgo) use ($user) {
            $date = Carbon::now()->subMonths($monthsAgo);
            $total = $user->debts()
                ->where('type', 'outflow')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_prete');
            return [
                'mois'  => $date->format('M Y'),
                'total' => (float) $total,
            ];
        });

        return response()->json([
            'finances' => [
                'total_dettes'   => (float) $totalDettes,
                'total_creances' => (float) $totalCreances,
                'solde_net'      => (float) $soldeNet,
                'en_retard'      => $debtsEnRetard,
                'echeances_j7'   => $debtsProches,
            ],
            'charges' => [
                'total_du'    => (float) $chargesTotal,
                'total_paye'  => (float) $chargesPayees,
                'restant'     => (float) $chargesRestant,
                'en_retard'   => $chargesEnRetard,
                'taux_paiement' => $chargesTotal > 0
                    ? round(($chargesPayees / $chargesTotal) * 100, 1)
                    : 0,
            ],
            'voiture' => [
                'enregistree' => (bool) $voiture,
                'alertes'     => $voitureAlertes,
                'nb_alertes'  => count($voitureAlertes),
            ],
            'notifications_non_lues' => $unreadNotifs,
            'charts' => [
                'charges_par_categorie' => $chargesParCategorie,
                'evolution_dettes'      => $evolutionDettes,
            ],
        ]);
    }
}
