<?php

namespace App\Http\Controllers;

use App\Models\Tier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TierController extends Controller
{
    /**
     * GET /api/tiers
     */
    public function index(Request $request): JsonResponse
    {
        $tiers = $request->user()
            ->tiers()
            ->withCount('debts')
            ->get()
            ->map(function ($tier) {
                $tier->solde = $tier->solde;
                return $tier;
            });

        return response()->json($tiers);
    }

    /**
     * POST /api/tiers
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'type'    => 'required|in:ami,famille,collègue,autre',
            'contact' => 'nullable|string|max:150',
        ]);

        $tier = $request->user()->tiers()->create($validated);

        return response()->json($tier, 201);
    }

    /**
     * GET /api/tiers/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $tier = $request->user()->tiers()->with('debts')->findOrFail($id);
        $tier->solde = $tier->solde;

        return response()->json($tier);
    }

    /**
     * PUT /api/tiers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tier = $request->user()->tiers()->findOrFail($id);

        $validated = $request->validate([
            'name'    => 'sometimes|string|max:100',
            'type'    => 'sometimes|in:ami,famille,collègue,autre',
            'contact' => 'nullable|string|max:150',
        ]);

        $tier->update($validated);

        return response()->json($tier);
    }

    /**
     * DELETE /api/tiers/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $tier = $request->user()->tiers()->findOrFail($id);
        $tier->delete();

        return response()->json(['message' => 'Tiers supprimé.']);
    }
}
