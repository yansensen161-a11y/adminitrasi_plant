<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanInspection extends Model
{
    protected $fillable = ['unit_id', 'inspection_date', 'category', 'is_completed'];

    protected $casts = [
        'inspection_date' => 'date',
        'is_completed' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
