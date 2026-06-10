<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminInvitation extends Model
{
    protected $guarded = [];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at'  => 'datetime',
    ];

    // ─── Relationships ─────────────────────────────────────────────────────

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isAccepted(): bool
    {
        return ! is_null($this->accepted_at);
    }

    public function isPending(): bool
    {
        return ! $this->isAccepted() && ! $this->isExpired();
    }

    public static function generateToken(): string
    {
        return Str::random(64);
    }
}
