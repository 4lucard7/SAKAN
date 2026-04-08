<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


// app/Models/Tier.php
class Tier extends Model
{
    protected $fillable = ['user_id', 'name', 'type', 'contact'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class, 'tier_id');
    }

    // Solde calculé pour ce tiers
    public function getSoldeAttribute(): float
    {
        return $this->debts->sum('reste');
    }
}
