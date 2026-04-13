<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;



// app/Models/VoitureMaintenance.php
class VoitureMaintenance extends Model
{
    protected $table    = 'voiture_maintenance';
    protected $fillable = [
        'car_id', 'part_name', 'kilometrage_actuel',
        'limit_km', 'last_change_date', 'duration', 'cout', 'notes', 'is_required'
    ];

    protected $casts = [
        'last_change_date' => 'datetime',
        'is_required'      => 'boolean',
    ];

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'car_id');
    }

    // Date prévisionnelle prochaine intervention
    public function getProchaineDateAttribute(): ?Carbon
    {
        return $this->duration
            ? $this->last_change_date->addMonths($this->duration)
            : null;
    }

    // Km prévisionnel prochaine intervention
    public function getProchaineKmAttribute(): ?int
    {
        return $this->limit_km
            ? $this->kilometrage_actuel + $this->limit_km
            : null;
    }
}
