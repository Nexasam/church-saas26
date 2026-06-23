<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class Celebration extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date'            => 'date',
        'acknowledged_at' => 'datetime',
        'acknowledged'    => 'boolean',
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

    public function member()   { return $this->belongsTo(Member::class); }
    public function category() { return $this->belongsTo(CelebrationCategory::class, 'category_id'); }
}
