<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TierController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SAKAN — API Routes
|--------------------------------------------------------------------------
|
| Toutes les routes sont préfixées par /api (via bootstrap/app.php).
| Les routes protégées nécessitent un token Sanctum dans le header :
|   Authorization: Bearer {token}
|
*/

// ── Authentification (publiques) ─────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// ── Routes protégées (Sanctum) ───────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Tiers ─────────────────────────────────────────────────────
    Route::apiResource('tiers', TierController::class);

    // ── Dettes / Créances ─────────────────────────────────────────
    Route::apiResource('debts', DebtController::class);
    Route::patch('/debts/{id}/rembourser', [DebtController::class, 'rembourser']);

    // ── Véhicule ──────────────────────────────────────────────────
    Route::get('/voiture',    [VoitureController::class, 'show']);
    Route::post('/voiture',   [VoitureController::class, 'store']);
    Route::put('/voiture',    [VoitureController::class, 'update']);
    Route::delete('/voiture', [VoitureController::class, 'destroy']);

    // ── Maintenances véhicule ─────────────────────────────────────
    Route::get('/voiture/maintenances',        [MaintenanceController::class, 'index']);
    Route::post('/voiture/maintenances',       [MaintenanceController::class, 'store']);
    Route::get('/voiture/maintenances/{id}',   [MaintenanceController::class, 'show']);
    Route::put('/voiture/maintenances/{id}',   [MaintenanceController::class, 'update']);
    Route::delete('/voiture/maintenances/{id}',[MaintenanceController::class, 'destroy']);

    // ── Charges fixes ─────────────────────────────────────────────
    Route::get('/charges/historique',         [ChargeController::class, 'historique']);
    Route::apiResource('charges', ChargeController::class);
    Route::patch('/charges/{id}/statut',      [ChargeController::class, 'updateStatut']);

    // ── Notifications ─────────────────────────────────────────────
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/lire',  [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/lire-tout',   [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications',           [NotificationController::class, 'destroyAll']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);
});
