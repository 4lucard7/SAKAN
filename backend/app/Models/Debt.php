<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


// app/Models/Debt.php
class Debt extends Model
{
    protected $fillable = [
        'user_id', 'tier_id', 'total_prete', 'total_rembourse',
        'reste', 'type', 'statut', 'due_date', 'notes', 'is_required'
    ];

    protected $casts = [
        'due_date'         => 'datetime',
        'total_prete'      => 'float',
        'total_rembourse'  => 'float',
        'reste'            => 'float',
        'is_required'      => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(Tier::class, 'tier_id');
    }

    // Recalcule automatiquement "reste" avant sauvegarde
    protected static function booted(): void
    {
        static::saving(function (Debt $debt) {
            $debt->reste  = (float) ($debt->total_prete - $debt->total_rembourse);
            $debt->statut = match(true) {
                $debt->reste <= 0                                    => 'solde',
                $debt->total_rembourse > 0                           => 'partiellement_solde',
                $debt->due_date && $debt->due_date->isPast()         => 'en_retard',
                default                                              => 'en_cours',
            };
        });
    }
}
