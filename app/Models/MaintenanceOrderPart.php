<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceOrderPart extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'maintenance_order_id',
        'department',
        'component',
        'component_name',
        'part_number',
        'qty',
        'life_time',
        'due_date_part',
        'pr',
        'po',
        'image',
        'swap_to_unit_id',
    ];

    public function order()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }

    public function swapToUnit()
    {
        return $this->belongsTo(Unit::class, 'swap_to_unit_id');
    }
}
