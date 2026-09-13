<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MagneticPlug extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'unit_id',
        'hm',
        'date',
        'metode_filter',
        'component',
        'rating',
        'remarks',
        'photo_path',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
