<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class FollowUp extends Model
{
    protected $guarded = [];

    protected $casts = [
        'last_contact_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);
        static::creating(function (self $m) {
            if (! $m->church_id && auth()->check()) {
                $m->church_id = auth()->user()->church_id;
            }
        });
    }

    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function tasks()      { return $this->hasMany(FollowUpTask::class); }
}
