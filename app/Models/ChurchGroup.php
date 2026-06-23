<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class ChurchGroup extends Model
{
    protected $guarded = [];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);

        static::creating(function (self $group) {
            if (! $group->church_id && auth()->check()) {
                $group->church_id = auth()->user()->church_id;
            }
        });
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function members()
    {
        return $this->belongsToMany(Member::class, 'church_group_member')
            ->withPivot(['joined_at'])
            ->withTimestamps();
    }
}
