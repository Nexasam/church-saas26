<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProspectiveMemberLog extends Model
{
    protected $guarded = [];

    public function prospectiveMember()
    {
        return $this->belongsTo(ProspectiveMember::class);
    }

    public function loggedBy()
    {
        return $this->belongsTo(User::class, 'logged_by');
    }
}
