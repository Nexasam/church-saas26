<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareCaseNote extends Model
{
    protected $guarded = [];

    public function careCase() { return $this->belongsTo(CareCase::class); }
    public function loggedBy() { return $this->belongsTo(User::class, 'logged_by'); }
}
