<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanInspectionTarget extends Model
{
    protected $fillable = [
        'unit_id',
        'category',
        'month',
        'year',
        'target_value',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
