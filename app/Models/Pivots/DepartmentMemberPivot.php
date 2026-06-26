<?php

namespace App\Models\Pivots;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DepartmentMemberPivot extends Pivot
{
    protected $casts = [
        'joined_at' => 'date',
        'is_active'  => 'boolean',
    ];
}
