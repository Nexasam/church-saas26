<?php

namespace App\Models;

use App\Scopes\ChurchScope;
use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    protected $guarded = [];

    protected static function booted(): void
    {
        static::addGlobalScope(new ChurchScope);

        static::creating(function (self $field) {
            if (! $field->church_id && auth()->check()) {
                $field->church_id = auth()->user()->church_id;
            }
        });
    }

    protected $casts = [
        'options' => 'array',
    ];

    public function church()
    {
        return $this->belongsTo(Church::class);
    }

    public function values()
    {
        return $this->hasMany(CustomFieldValue::class);
    }
}
