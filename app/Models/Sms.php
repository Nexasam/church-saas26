<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class Sms extends Model
{
    protected $guarded = [];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);

        static::creating(function (self $sms) {
            if (! $sms->church_id && auth()->check()) {
                $sms->church_id = auth()->user()->church_id;
            }
        });
    }

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function recipients()
    {
        return $this->hasMany(SmsRecipient::class);
    }
}
