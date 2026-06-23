<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'dob' => 'date',
    ];

    /**
     * A member can belong to many churches (multi-church SaaS)
     */
    public function churches()
    {
        return $this->belongsToMany(\App\Models\Church::class, 'church_member')
            ->withPivot(['membership_type', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Only active memberships
     */
    public function activeChurches()
    {
        return $this->churches()->wherePivot('is_active', true);
    }

    /**
     * A member can belong to many home churches across different churches
     */
    public function homeChurches()
    {
        return $this->belongsToMany(\App\Models\HomeChurch::class, 'home_church_member')
            ->withPivot(['church_id', 'role', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Only active home church memberships
     */
    public function activeHomeChurches()
    {
        return $this->homeChurches()->wherePivot('is_active', true);
    }

    /**
     * Departments a member belongs to
     */
    public function departments()
    {
        return $this->belongsToMany(\App\Models\Department::class, 'department_member')
            ->withPivot(['role', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * Only active departments
     */
    public function activeDepartments()
    {
        return $this->departments()->wherePivot('is_active', true);
    }

    /**
     * Filter departments by church (multi-church)
     */
    public function departmentsInChurch(int $churchId)
    {
        return $this->departments()->whereHas('church', fn($q) => $q->where('id', $churchId));
    }
}
