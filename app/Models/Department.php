<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use App\Models\Pivots\DepartmentMemberPivot;
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
                    ->using(DepartmentMemberPivot::class)
                    ->withPivot(['role', 'is_active', 'joined_at'])
                    ->withTimestamps();
    }

    public function workers()
    {
        return $this->belongsToMany(Member::class)
                    ->using(DepartmentMemberPivot::class)
                    ->withPivot(['role', 'is_active', 'joined_at'])
                    ->wherePivotIn('role', ['worker', 'leader'])
                    ->wherePivot('is_active', true)
                    ->withTimestamps();
    }

    public function leaders()
    {
        return $this->belongsToMany(Member::class)
                    ->using(DepartmentMemberPivot::class)
                    ->withPivot(['role', 'is_active', 'joined_at'])
                    ->wherePivot('role', 'leader')
                    ->wherePivot('is_active', true)
                    ->withTimestamps();
    }

    /**
     * The church this department belongs to
     */
    public function church()
    {
        return $this->belongsTo(Church::class);
    }

}
