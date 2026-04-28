<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

use Illuminate\Database\Eloquent\SoftDeletes;

// app/Models/Notification.php
class Notification extends Model
{
    use SoftDeletes;

    public $timestamps = false;

    protected static function booted()
    {
        static::created(function ($notification) {
            event(new \App\Events\NewNotificationEvent($notification));
        });
    }

    protected $fillable = [
        'user_id', 'type', 'message',
        'is_read', 'is_required', 'reference_type', 'reference_id', 'reminder_tier', 'created_at'
    ];

    protected $casts = [
        'is_read'     => 'boolean',
        'is_required' => 'boolean',
        'created_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Entité liée (polymorphique manuel)
    public function reference(): MorphTo
    {
        return $this->morphTo('reference');
    }
}
