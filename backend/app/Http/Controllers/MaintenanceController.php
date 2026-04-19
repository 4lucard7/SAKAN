<?php

namespace App\Http\Controllers;

use App\Models\VoitureMaintenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{

    /**
     * GET /api/voiture/maintenances
     */
    public function index(Request $request): JsonResponse
    {
        $carId = $request->query('car_id');
        if ($carId) {
            $voiture = $request->user()->voitures()->find($carId);
            if (!$voiture) {
                abort(403, 'Accès refusé à cette voiture.');
            }
        } else {
            $voiture = $request->user()->voiture;
            if (!$voiture) {
                return response()->json([]);
            }
        }

        $maintenances = $voiture->maintenances()->get()->map(function ($m) {
            $m->prochaine_date  = $m->prochaine_date;
            $m->prochain_km     = $m->prochain_km;
            $m->statut_alerte   = $m->statut_alerte;
            return $m;
        });

        return response()->json($maintenances);
    }

    /**
     * POST /api/voiture/maintenances
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'car_id'              => 'sometimes|integer|exists:voiture,id',
            'part_name'           => 'required|string|max:100',
            'kilometrage_actuel'  => 'required|integer|min:0',
            'limit_km'            => 'nullable|integer|min:0',
            'last_change_date'    => 'required|date',
            'duration'            => 'nullable|integer|min:1|max:120',
            'cost'                => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string',
            'priority'            => 'required|in:normal,important',
        ]);

        if (!isset($validated['car_id'])) {
            $voiture = $request->user()->voiture;
            if (!$voiture) {
                abort(404, 'Aucun véhicule enregistré.');
            }
            $validated['car_id'] = $voiture->id;
        } else {
            $voiture = $request->user()->voitures()->find($validated['car_id']);
            if (!$voiture) {
                abort(403, 'Accès refusé à cette voiture.');
            }
        }

        // Map cost to cout for database
        if (array_key_exists('cost', $validated)) {
            $validated['cout'] = $validated['cost'];
            unset($validated['cost']);
        }

        // Map priority to is_required
        if (isset($validated['priority'])) {
            $validated['is_required'] = $validated['priority'] === 'important';
            unset($validated['priority']);
        }

        $maintenance = VoitureMaintenance::create($validated);

        // Met à jour le kilométrage actuel du véhicule si supérieur
        if ($validated['kilometrage_actuel'] > $voiture->current_km) {
            $voiture->update(['current_km' => $validated['kilometrage_actuel']]);
        }

        $maintenance->prochaine_date = $maintenance->prochaine_date;
        $maintenance->prochain_km    = $maintenance->prochain_km;
        $maintenance->statut_alerte  = $maintenance->statut_alerte;

        return response()->json($maintenance, 201);
    }

    /**
     * GET /api/voiture/maintenances/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $maintenance = VoitureMaintenance::where('id', $id)
            ->whereHas('voiture', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        $maintenance->prochaine_date = $maintenance->prochaine_date;
        $maintenance->prochain_km    = $maintenance->prochain_km;
        $maintenance->statut_alerte  = $maintenance->statut_alerte;

        return response()->json($maintenance);
    }

    /**
     * PUT /api/voiture/maintenances/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $maintenance = VoitureMaintenance::where('id', $id)
            ->whereHas('voiture', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        $validated = $request->validate([
            'car_id'              => 'sometimes|integer|exists:voiture,id',
            'part_name'           => 'sometimes|string|max:100',
            'kilometrage_actuel'  => 'sometimes|integer|min:0',
            'limit_km'            => 'nullable|integer|min:0',
            'last_change_date'    => 'sometimes|date',
            'duration'            => 'nullable|integer|min:1|max:120',
            'cost'                => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string',
            'priority'            => 'sometimes|in:normal,important',
        ]);

        if (isset($validated['car_id'])) {
            $voiture = $request->user()->voitures()->find($validated['car_id']);
            if (!$voiture) {
                abort(403, 'Accès refusé à cette voiture.');
            }
        }

        // Map cost to cout for database
        if (array_key_exists('cost', $validated)) {
            $validated['cout'] = $validated['cost'];
            unset($validated['cost']);
        }

        // Map priority to is_required
        if (isset($validated['priority'])) {
            $validated['is_required'] = $validated['priority'] === 'important';
            unset($validated['priority']);
        }

        $maintenance->update($validated);
        $maintenance->prochaine_date = $maintenance->prochaine_date;
        $maintenance->prochain_km    = $maintenance->prochain_km;
        $maintenance->statut_alerte  = $maintenance->statut_alerte;

        return response()->json($maintenance);
    }

    /**
     * DELETE /api/voiture/maintenances/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $maintenance = VoitureMaintenance::where('id', $id)
            ->whereHas('voiture', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        $maintenance->delete();

        return response()->json(['message' => 'Maintenance supprimée.']);
    }
}
