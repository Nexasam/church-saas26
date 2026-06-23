<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class FollowUpTask extends Model
{
    protected $guarded = [];

    protected $casts = [
        'due_date' => 'date',
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

    public function followUp()   { return $this->belongsTo(FollowUp::class); }
    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
}
