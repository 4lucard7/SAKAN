<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    /**
     * GET /api/debts
     * Filtres : ?type=outflow|inflow  &statut=en_cours|...  &tier_id=x  &from=Y-m-d  &to=Y-m-d
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()
            ->debts()
            ->with('tier');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('tier_id')) {
            $query->where('tier_id', $request->tier_id);
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $debts = $query->latest()->get()->map(function ($debt) {
            $debt->statut = $debt->statut;
            return $debt;
        });

        // Filtrage par statut dynamique (calculé) après récupération
        if ($request->filled('statut')) {
            $debts = $debts->filter(fn($d) => $d->statut === $request->statut)->values();
        }

        return response()->json($debts);
    }

    /**
     * POST /api/debts
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tier_id'     => 'required|integer|exists:tiers,id',
            'total_prete' => 'required|numeric|min:0.01',
            'type'        => 'required|in:outflow,inflow',
            'due_date'    => 'nullable|date',
            'notes'       => 'nullable|string',
            'is_required' => 'sometimes|boolean',
        ]);

        // S'assurer que le tiers appartient à l'utilisateur
        $request->user()->tiers()->findOrFail($validated['tier_id']);

        $validated['user_id']         = $request->user()->id;
        $validated['total_rembourse'] = 0;

        $debt         = Debt::create($validated);
        $debt->statut = $debt->statut;

        return response()->json($debt->load('tier'), 201);
    }

    /**
     * GET /api/debts/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $debt         = $request->user()->debts()->with('tier')->findOrFail($id);
        $debt->statut = $debt->statut;

        return response()->json($debt);
    }

    /**
     * PUT /api/debts/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $debt = $request->user()->debts()->findOrFail($id);

        $validated = $request->validate([
            'tier_id'     => 'sometimes|integer|exists:tiers,id',
            'total_prete' => 'sometimes|numeric|min:0.01',
            'type'        => 'sometimes|in:outflow,inflow',
            'due_date'    => 'nullable|date',
            'notes'       => 'nullable|string',
            'is_required' => 'sometimes|boolean',
        ]);

        $debt->update($validated);
        $debt->statut = $debt->statut;

        return response()->json($debt->load('tier'));
    }

    /**
     * PATCH /api/debts/{id}/rembourser
     * Enregistre un remboursement partiel ou total
     */
    public function rembourser(Request $request, int $id): JsonResponse
    {
        $debt = $request->user()->debts()->findOrFail($id);

        $validated = $request->validate([
            'montant' => 'required|numeric|min:0.01',
        ]);

        $nouveauTotal = min(
            $debt->total_rembourse + $validated['montant'],
            $debt->total_prete
        );

        $debt->total_rembourse = $nouveauTotal;
        $debt->recalculerReste();
        $debt->statut = $debt->statut;

        return response()->json($debt->load('tier'));
    }

    /**
     * DELETE /api/debts/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $debt = $request->user()->debts()->findOrFail($id);
        $debt->delete();

        return response()->json(['message' => 'Transaction supprimée.']);
    }
}
