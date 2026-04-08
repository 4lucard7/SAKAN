<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


// app/Models/Charge.php
class Charge extends Model
{
    protected $fillable = [
        'user_id', 'libelle', 'categorie', 'montant',
        'jour_echeance', 'mois', 'annee', 'statut',
        'date_paiement', 'actif'
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'actif'         => 'boolean',
        'montant'       => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope charges du mois courant
    public function scopeCurrentMonth(Builder $query): Builder
    {
        return $query->where('mois', now()->month)
                     ->where('annee', now()->year);
    }
}
