<?php

namespace App\Models;

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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(VoitureMaintenance::class, 'car_id');
    }
}
