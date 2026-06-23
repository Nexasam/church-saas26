<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class CelebrationCategory extends Model
{
    protected $guarded = [];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);
        static::creating(function (self $m) {
            if (! $m->church_id && auth()->check()) {
                $m->church_id = auth()->user()->church_id;
            }
        });
    }

    public function celebrations() { return $this->hasMany(Celebration::class, 'category_id'); }
}
