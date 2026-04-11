<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoitureController extends Controller
{
    /**
     * GET /api/voiture
     * Retourne la fiche du véhicule de l'utilisateur (unique)
     */
    public function show(Request $request): JsonResponse
    {
        $voiture = $request->user()->voiture;

        if (!$voiture) {
            return response()->json(null, 200);
        }

        $voiture->responsabilites = $voiture->responsabilites;

        return response()->json($voiture->load('maintenances'));
    }

    /**
     * POST /api/voiture
     * Crée la fiche véhicule (une seule autorisée par utilisateur)
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->voiture) {
            return response()->json(['message' => 'Un véhicule est déjà enregistré. Utilisez PUT pour le modifier.'], 422);
        }

        $validated = $request->validate([
            'car_name'                    => 'required|string|max:100',
            'current_km'                  => 'required|integer|min:0',
            'assurance_expiry'            => 'nullable|date',
            'vignette_expiry'             => 'nullable|date',
            'controle_technique_expiry'   => 'nullable|date',
            'carte_grise_expiry'          => 'nullable|date',
        ]);

        $validated['user_id'] = $request->user()->id;
        $voiture = Voiture::create($validated);
        $voiture->responsabilites = $voiture->responsabilites;

        return response()->json($voiture, 201);
    }

    /**
     * PUT /api/voiture
     * Met à jour la fiche véhicule
     */
    public function update(Request $request): JsonResponse
    {
        $voiture = $request->user()->voiture;

        if (!$voiture) {
            return response()->json(['message' => 'Aucun véhicule enregistré.'], 404);
        }

        $validated = $request->validate([
            'car_name'                    => 'sometimes|string|max:100',
            'current_km'                  => 'sometimes|integer|min:0',
            'assurance_expiry'            => 'nullable|date',
            'vignette_expiry'             => 'nullable|date',
            'controle_technique_expiry'   => 'nullable|date',
            'carte_grise_expiry'          => 'nullable|date',
        ]);

        $voiture->update($validated);
        $voiture->responsabilites = $voiture->responsabilites;

        return response()->json($voiture);
    }

    /**
     * DELETE /api/voiture
     */
    public function destroy(Request $request): JsonResponse
    {
        $voiture = $request->user()->voiture;

        if (!$voiture) {
            return response()->json(['message' => 'Aucun véhicule enregistré.'], 404);
        }

        $voiture->delete();

        return response()->json(['message' => 'Véhicule supprimé.']);
    }
}
