<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChurchSmsSetting extends Model
{
    protected $guarded = [];

    protected $table = 'church_sms_settings';

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
    ];

    public function church()
    {
        return $this->belongsTo(Church::class);
    }
}
