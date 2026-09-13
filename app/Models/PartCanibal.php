<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartCanibal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'no_request',
        'tanggal',
        'unit_id',
        'hm',
        'part_name',
        'dari_unit_id',
        'qty',
        'description',
        'remark',
        'no_order',
        'pr',
        'po',
        'eta_part',
        'status',
        'image',
        'maintenance_order_id',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function dariUnit()
    {
        return $this->belongsTo(Unit::class, 'dari_unit_id');
    }

    public function parts()
    {
        return $this->hasMany(PartCanibalPart::class, 'part_canibal_id');
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }
}
