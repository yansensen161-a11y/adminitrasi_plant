<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Breakdown extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'unit_id',
        'equipment_group',
        'date',
        'loc',
        'hm',
        'est_finish',
        'aging',
        'status',
        'maintenance_order_id',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tasks()
    {
        return $this->hasMany(BreakdownTask::class);
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }
}
