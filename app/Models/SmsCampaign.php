<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class SmsCampaign extends Model
{
    protected $guarded = [];

    protected $casts = [
        'sent_at'      => 'datetime',
        'scheduled_at' => 'datetime',
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

    public function sentBy() { return $this->belongsTo(User::class, 'sent_by'); }
}
