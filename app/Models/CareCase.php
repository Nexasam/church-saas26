<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class CareCase extends Model
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

    public function church()    { return $this->belongsTo(Church::class); }
    public function member()    { return $this->belongsTo(Member::class); }
    public function assignedTo(){ return $this->belongsTo(User::class, 'assigned_to'); }
    public function notes()     { return $this->hasMany(CareCaseNote::class)->orderByDesc('created_at'); }
}
