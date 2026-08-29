<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'service_type',
        'target_hm',
        'actual_hm',
        'target_date',
        'actual_date',
        'status',
        'work_hours_per_day',
        'back_evo',
        'accuracy',
    ];

    protected $casts = [
        'target_date' => 'date',
        'actual_date' => 'date',
        'target_hm' => 'float',
        'actual_hm' => 'float',
        'accuracy' => 'float',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
