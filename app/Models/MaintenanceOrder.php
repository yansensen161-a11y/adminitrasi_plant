<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'no_order',
        'tanggal',
        'unit_id',
        'hm',
        'lokasi',
        'priority',
        'status',
        'pic',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function parts()
    {
        return $this->hasMany(MaintenanceOrderPart::class, 'maintenance_order_id');
    }
}
