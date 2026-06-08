<?php
namespace App\Models\Traits;

trait HasChurchScope
{
    public function scopeForAuthChurch($query)
    {
        if(auth()->check()) {
            $query->where('church_id', auth()->user()->church_id);
        }
        return $query;
    }
}
