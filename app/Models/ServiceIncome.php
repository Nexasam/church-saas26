<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class ServiceIncome extends Model
{
    protected $guarded = [];

    protected $casts = [
        'service_date'    => 'date',
        'banked_date'     => 'date',
        'reconciled_at'   => 'datetime',
        'recorded_amount' => 'float',
        'banked_amount'   => 'float',
        'variance'        => 'float',
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
}
