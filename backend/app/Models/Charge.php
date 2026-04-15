<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


// app/Models/Charge.php
class Charge extends Model
{
    protected $fillable = [
        'user_id', 'libelle', 'categorie', 'montant',
        'jour_echeance', 'mois', 'annee', 'statut',
        'date_paiement', 'actif', 'is_required', 'priority'
    ];

    protected $casts = [
        'date_paiement' => 'date',
        'actif'         => 'boolean',
        'is_required'   => 'boolean',
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

    public function verifierStatut(): void
    {
        if ($this->statut === 'payee') {
            return;
        }

        if ($this->date_paiement && $this->statut !== 'payee') {
            $this->statut = 'payee';
            $this->saveQuietly();
            return;
        }

        $echeance = Carbon::create($this->annee, $this->mois, $this->jour_echeance)->startOfDay();

        if (now()->startOfDay()->gt($echeance) && $this->statut !== 'en_retard') {
            $this->statut = 'en_retard';
            $this->saveQuietly();
        }
    }
}
