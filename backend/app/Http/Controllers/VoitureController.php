<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoitureController extends Controller
{
    private function getDefaultVoiture(Request $request): ?Voiture
    {
        return $request->user()->voiture;
    }

    private function getVoitureById(Request $request, int $id): Voiture
    {
        return $request->user()->voitures()->findOrFail($id);
    }

    private function hydrateResponsabilites(Voiture $voiture): void
    {
        $voiture->responsabilites = $voiture->responsabilites;
    }

    /**
     * GET /api/voitures
     */
    public function index(Request $request): JsonResponse
    {
        $voitures = $request->user()->voitures()->with('maintenances')->get();
        $voitures->each(fn ($voiture) => $this->hydrateResponsabilites($voiture));

        return response()->json($voitures);
    }

    /**
     * GET /api/voiture
     */
    public function showDefault(Request $request): JsonResponse
    {
        $voiture = $this->getDefaultVoiture($request);

        if (!$voiture) {
            return response()->json(null, 200);
        }

        $this->hydrateResponsabilites($voiture);

        return response()->json($voiture->load('maintenances'));
    }

    /**
     * GET /api/voitures/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $voiture = $this->getVoitureById($request, $id);
        $this->hydrateResponsabilites($voiture);

        return response()->json($voiture->load('maintenances'));
    }

    /**
     * POST /api/voitures
     */
    public function store(Request $request): JsonResponse
    {
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
        $this->hydrateResponsabilites($voiture);

        return response()->json($voiture, 201);
    }

    /**
     * POST /api/voiture
     */
    public function storeDefault(Request $request): JsonResponse
    {
        return $this->store($request);
    }

    /**
     * PUT /api/voitures/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $voiture = $this->getVoitureById($request, $id);

        $validated = $request->validate([
            'car_name'                    => 'sometimes|string|max:100',
            'current_km'                  => 'sometimes|integer|min:0',
            'assurance_expiry'            => 'nullable|date',
            'vignette_expiry'             => 'nullable|date',
            'controle_technique_expiry'   => 'nullable|date',
            'carte_grise_expiry'          => 'nullable|date',
        ]);

        $voiture->update($validated);
        $this->hydrateResponsabilites($voiture);

        return response()->json($voiture);
    }

    /**
     * PUT /api/voiture
     */
    public function updateDefault(Request $request): JsonResponse
    {
        $voiture = $this->getDefaultVoiture($request);

        if (!$voiture) {
            return response()->json(['message' => 'Aucun véhicule enregistré.'], 404);
        }

        return $this->update($request, $voiture->id);
    }

    /**
     * DELETE /api/voitures/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $voiture = $this->getVoitureById($request, $id);
        $voiture->delete();

        return response()->json(['message' => 'Véhicule supprimé.']);
    }

    /**
     * DELETE /api/voiture
     */
    public function destroyDefault(Request $request): JsonResponse
    {
        $voiture = $this->getDefaultVoiture($request);

        if (!$voiture) {
            return response()->json(['message' => 'Aucun véhicule enregistré.'], 404);
        }

        $voiture->delete();

        return response()->json(['message' => 'Véhicule supprimé.']);
    }
}
