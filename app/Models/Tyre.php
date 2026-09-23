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
        'prev_life',
        'total_hm',
        'installed_km',
        'total_km',
        'pattern',
        'psi',
        'plan_rotary_target',
        'plan_action',
        'plan_rotary_date',
        'otd',
        'rtd',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'installed_hm' => 'decimal:2',
        'prev_life' => 'decimal:2',
        'total_hm' => 'decimal:2',
        'installed_km' => 'decimal:2',
        'total_km' => 'decimal:2',
        'plan_rotary_target' => 'decimal:2',
        'plan_rotary_date' => 'date',
    ];

    protected $appends = [
        'current_life_time',
        'total_lifetime',
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

    /** Accumulated HM since installation on current unit (Lifetime Running) */
    public function getCurrentLifeTimeAttribute(): float
    {
        if (! $this->unit_id) {
            return 0.0;
        }

        $currentUnitHm = (float) ($this->unit?->hm ?? 0);
        $installedHm = (float) ($this->installed_hm ?? 0);
        $isOriginal = str_contains(strtoupper((string) $this->notes), 'ORIGINAL BY UNIT');

        if ($isOriginal || $installedHm <= 0) {
            return round($currentUnitHm, 1);
        }

        return round(max(0, $currentUnitHm - $installedHm), 1);
    }

    /** Total Lifetime (Prev Life + Current Life Time) */
    public function getTotalLifetimeAttribute(): float
    {
        $prevLife = (float) ($this->prev_life ?? 0);

        return round($prevLife + $this->current_life_time, 1);
    }
}
