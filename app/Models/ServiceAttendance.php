<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Scopes\ChurchScope;

class ServiceAttendance extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Apply global church scope automatically if needed
     */
    protected static function booted()
    {
        static::addGlobalScope(new ChurchScope);
    }

    /**
     * The member who attended the service
     */
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * The church where the service was held
     */
    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    /**
     * Helper: Check if the member belongs to this church
     *
     * @return bool
     */
    public function memberBelongsToChurch(): bool
    {
        if (!$this->member || !$this->church) {
            return false;
        }

        return $this->member->churches()
            ->where('church_id', $this->church->id)
            ->exists();
    }

    /**
     * Scope: only attendance of active members
     */
    public function scopeActiveMembers($query)
    {
        return $query->whereHas('member', function($q){
            $q->whereHas('churches', function($qc){
                $qc->wherePivot('is_active', true);
            });
        });
    }
}
