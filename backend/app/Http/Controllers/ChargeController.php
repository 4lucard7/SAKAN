<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChargeController extends Controller
{
    /**
     * GET /api/charges
     * Filtres : ?mois=x&annee=y&statut=en_attente|payee|en_retard&actif=1
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->charges();

        if ($request->filled('mois')) {
            $query->where('mois', $request->mois);
        }
        if ($request->filled('annee')) {
            $query->where('annee', $request->annee);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('actif')) {
            $query->where('actif', (bool) $request->actif);
        }

        $charges = $query->orderBy('jour_echeance')->get();

        // Vérifie et met à jour les retards avant de retourner
        $charges->each(fn($c) => $c->verifierStatut());

        // Résumé du mois si filtré
        $resume = null;
        if ($request->filled('mois') && $request->filled('annee')) {
            $resume = [
                'total_du'    => $charges->sum('montant'),
                'total_paye'  => $charges->where('statut', 'payee')->sum('montant'),
                'total_reste' => $charges->whereIn('statut', ['en_attente', 'en_retard'])->sum('montant'),
                'en_retard'   => $charges->where('statut', 'en_retard')->count(),
            ];
        }

        return response()->json(['charges' => $charges, 'resume' => $resume]);
    }

    /**
     * POST /api/charges
     * Crée une charge récurrente (modèle) + l'occurrence du mois courant
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'libelle'       => 'required|string|max:100',
            'categorie'     => 'nullable|string|max:50',
            'montant'       => 'required|numeric|min:0.01',
            'jour_echeance' => 'required|integer|min:1|max:28',
        ]);

        $now = Carbon::now();

        $validated['user_id'] = $request->user()->id;
        $validated['mois']    = $now->month;
        $validated['annee']   = $now->year;
        $validated['statut']  = 'en_attente';
        $validated['actif']   = true;

        $charge = Charge::create($validated);

        return response()->json($charge, 201);
    }

    /**
     * GET /api/charges/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $charge = $request->user()->charges()->findOrFail($id);
        $charge->verifierStatut();

        return response()->json($charge);
    }

    /**
     * PUT /api/charges/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $charge = $request->user()->charges()->findOrFail($id);

        $validated = $request->validate([
            'libelle'       => 'sometimes|string|max:100',
            'categorie'     => 'nullable|string|max:50',
            'montant'       => 'sometimes|numeric|min:0.01',
            'jour_echeance' => 'sometimes|integer|min:1|max:28',
            'actif'         => 'sometimes|boolean',
        ]);

        $charge->update($validated);

        return response()->json($charge);
    }

    /**
     * PATCH /api/charges/{id}/statut
     * Mise à jour manuelle du statut (payée, en_attente, en_retard)
     */
    public function updateStatut(Request $request, int $id): JsonResponse
    {
        $charge = $request->user()->charges()->findOrFail($id);

        $validated = $request->validate([
            'statut' => 'required|in:en_attente,payee,en_retard',
        ]);

        $charge->statut = $validated['statut'];

        if ($validated['statut'] === 'payee') {
            $charge->date_paiement = Carbon::today();
        } else {
            $charge->date_paiement = null;
        }

        $charge->save();

        return response()->json($charge);
    }

    /**
     * DELETE /api/charges/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $charge = $request->user()->charges()->findOrFail($id);
        $charge->delete();

        return response()->json(['message' => 'Charge supprimée.']);
    }

    /**
     * GET /api/charges/historique
     * Liste les mois/années disponibles dans l'historique
     */
    public function historique(Request $request): JsonResponse
    {
        $historique = $request->user()
            ->charges()
            ->selectRaw('mois, annee, SUM(montant) as total_du, SUM(CASE WHEN statut = "payee" THEN montant ELSE 0 END) as total_paye, COUNT(*) as nb_charges')
            ->whereNotNull('mois')
            ->groupBy('annee', 'mois')
            ->orderByDesc('annee')
            ->orderByDesc('mois')
            ->get();

        return response()->json($historique);
    }
}
