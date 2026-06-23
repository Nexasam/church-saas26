<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsRecipient extends Model
{
    protected $guarded = [];

    public function sms()
    {
        return $this->belongsTo(Sms::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
