<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomFieldValue extends Model
{
    protected $guarded = [];

    public function customField()
    {
        return $this->belongsTo(CustomField::class);
    }

    public function entity()
    {
        return $this->morphTo();
    }
}
