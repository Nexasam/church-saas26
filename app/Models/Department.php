<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $guarded = [];

    protected static function booted()
    {
        static::addGlobalScope(new ChurchScope);

        // Automatically inject church_id when creating
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->church_id = auth()->user()->church_id;
            }
        });
    }

    public function members()
    {
        return $this->belongsToMany(Member::class)
                    ->withPivot(['role', 'joined_at'])
                    ->withTimestamps();
    }

}
