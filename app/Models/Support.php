<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Support extends Model
{
    use HasFactory;

    protected $guarded = [];

    // protected $fillable = [
    //     'church_id',
    //     'amount',
    //     'reference',
    //     'channel',
    //     'status',
    // ];

    public function church()
    {
        return $this->belongsTo(Church::class);
    }
}
