<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class ProspectiveMember extends Model
{
    protected $guarded = [];

    protected $casts = [
        'date_won'      => 'date',
        'converted_at'  => 'datetime',
        'first_contacted_at' => 'date',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);

        static::creating(function (self $pm) {
            if (! $pm->church_id && auth()->check()) {
                $pm->church_id = auth()->user()->church_id;
            }
        });
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function broughtBy()
    {
        return $this->belongsTo(Member::class, 'brought_by');
    }

    public function followedUpBy()
    {
        return $this->belongsTo(Member::class, 'followed_up_by');
    }

    public function convertedMember()
    {
        return $this->belongsTo(Member::class, 'converted_member_id');
    }

    public function isConverted(): bool
    {
        return ! is_null($this->converted_at);
    }
}
