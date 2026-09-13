<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'wo_type',
        'no_order',
        'tanggal',
        'unit_id',
        'hm',
        'lokasi',
        'component',
        'component_name',
        'priority',
        'status',
        'pic',
        'downtime_start',
        'downtime_end',
        'actual_start',
        'actual_end',
        'failure_code',
        'root_cause',
        'action_taken',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function parts()
    {
        return $this->hasMany(MaintenanceOrderPart::class, 'maintenance_order_id');
    }

    public function breakdowns()
    {
        return $this->hasMany(Breakdown::class, 'maintenance_order_id');
    }

    public function pcr_ucs()
    {
        return $this->hasMany(PcrUc::class, 'maintenance_order_id');
    }

    public function service_logs()
    {
        return $this->hasMany(ServiceLog::class, 'maintenance_order_id');
    }
}
