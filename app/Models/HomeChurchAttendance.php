<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeChurchAttendance extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relationships
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function homeChurch()
    {
        return $this->belongsTo(HomeChurch::class);
    }
}
