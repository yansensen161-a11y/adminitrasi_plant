<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PcrUc extends Model
{
    use HasUuids;

    protected $fillable = [
        'unit_id',
        'part_number',
        'description',
        'component',
        'qty',
        'target_life_time',
        'hm_replace',
        'date_replace',
        'brand_produk',
        'hm_current',
        'life_time_pct',
        'worn_out',
        'inspection_date',
        'status',
        'status_penggantian',
        'next_plant',
        'replacement_history',
        'maintenance_order_id',
    ];

    protected $casts = [
        'replacement_history' => 'array',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function maintenanceOrder()
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }
}
