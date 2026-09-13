<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tyre extends Model
{
    use HasFactory;

    protected $fillable = [
        'serial_number',
        'brand',
        'type_size',
        'condition',
        'purchase_date',
        'purchase_price',
        'unit_id',
        'position',
        'installed_hm',
        'total_hm',
        'installed_km',
        'total_km',
        'tread_depth_new',
        'tread_depth_current',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'installed_hm' => 'decimal:2',
        'total_hm' => 'decimal:2',
        'installed_km' => 'decimal:2',
        'total_km' => 'decimal:2',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function histories()
    {
        return $this->hasMany(TyreHistory::class)->latest('event_date');
    }

    public function latestHistory()
    {
        return $this->hasOne(TyreHistory::class)->latestOfMany('event_date');
    }

    /** Accumulated HM since installation on current unit */
    public function getCurrentLifetimeAttribute(): float
    {
        if (! $this->unit_id || ! $this->installed_hm) {
            return (float) $this->total_hm;
        }

        $currentUnitHm = $this->unit?->hm ?? 0;

        return (float) $this->total_hm + max(0, $currentUnitHm - $this->installed_hm);
    }
}
