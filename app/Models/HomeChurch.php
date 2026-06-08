<?php
namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeChurch extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected static function booted()
    {
        // Apply church scope to all queries
        static::addGlobalScope(new ChurchScope);

        // Automatically inject church_id when creating
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->church_id = auth()->user()->church_id;
            }
        });
    }

    // Relationships
    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    // Members relationship via pivot table
    public function members()
    {
        return $this->belongsToMany(Member::class, 'home_church_member')
            ->withPivot(['church_id', 'role', 'is_active', 'joined_at'])
            ->withTimestamps();
    }

    // Only active members in this home church
    public function activeMembers()
    {
        return $this->members()->wherePivot('is_active', true);
    }
}
