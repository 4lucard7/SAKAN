<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



// app/Models/Voiture.php
class Voiture extends Model
{
    protected $table    = 'voiture';
    protected $fillable = [
        'user_id', 'car_name', 'current_km',
        'assurance_expiry', 'vignette_expiry',
        'controle_technique_expiry', 'carte_grise_expiry',
    ];

    protected $casts = [
        'assurance_expiry'          => 'date',
        'vignette_expiry'           => 'date',
        'controle_technique_expiry' => 'date',
        'carte_grise_expiry'        => 'date',
    ];

    protected $appends = ['responsabilites'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(VoitureMaintenance::class, 'car_id');
    }

    public function getResponsabilitesAttribute(): array
    {
        $today = Carbon::today();

        $documentExpiries = [
            'assurance'          => $this->assurance_expiry,
            'vignette'           => $this->vignette_expiry,
            'controle_technique' => $this->controle_technique_expiry,
            'carte_grise'        => $this->carte_grise_expiry,
        ];

        return collect($documentExpiries)->mapWithKeys(function ($expiry, $key) use ($today) {
            if (!$expiry) {
                return [$key => ['statut' => 'ok']];
            }

            $days = $today->diffInDays($expiry, false);

            if ($days < 0) {
                return [$key => ['statut' => 'expire', 'jours_restants' => abs($days)]];
            }

            if ($days <= 7) {
                return [$key => ['statut' => 'alerte_j7', 'jours_restants' => $days]];
            }

            if ($days <= 30) {
                return [$key => ['statut' => 'alerte_j30', 'jours_restants' => $days]];
            }

            return [$key => ['statut' => 'ok']];
        })->toArray();
    }
}
