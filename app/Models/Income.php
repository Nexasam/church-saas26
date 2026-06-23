<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    protected $guarded = [];

    protected $casts = ['income_date' => 'date'];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);
        static::creating(function (self $m) {
            if (! $m->church_id && auth()->check()) {
                $m->church_id = auth()->user()->church_id;
            }
        });
    }

    public function category() { return $this->belongsTo(IncomeCategory::class, 'income_category_id'); }
}
