<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WoPart extends Model
{
    protected $fillable = [
        'work_order_id',
        'maintenance_order_id',
        'maintenance_order_part_id',
        'no_order',
        'part_number',
        'description',
        'qty_request',
        'qty_used',
        'unit_price',
        'total',
        'supplier',
        'status',
        'pr',
        'po',
        'eta_part',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }

    public function maintenanceOrderPart()
    {
        return $this->belongsTo(MaintenanceOrderPart::class, 'maintenance_order_part_id');
    }
}
