<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Church extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'has_branches'        => 'boolean',
        'onboarding_complete' => 'boolean',
        'subscription_expiry' => 'date',
    ];

    public function supports()
    {
        return $this->hasMany(Support::class);
    }


    // Relationships
    public function members()
    {
        return $this->belongsToMany(Member::class)
            ->withPivot([
                'membership_type',
                'is_active',
                'joined_at'
            ])
            ->withTimestamps();
    }

    public function activeMembers()
    {
        return $this->members()
            ->wherePivot('is_active', true);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
    

    public function homeChurches()
    {
        return $this->hasMany(HomeChurch::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function supporters()
    {
        return $this->hasMany(Support::class);
    }
}
