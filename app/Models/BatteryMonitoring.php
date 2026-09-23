<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class BatteryMonitoring extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'code_unit',
        'brand_battery',
        'part_number',
        'part_number_description',
        'qty',
        'hm_instal',
        'hm_rusak',
        'lifetime_hours',
        'target_lifetime_hours',
        'tanggal_instal',
        'tanggal_rusak',
        'status',
        'posisi',
        'voltage',
        'penyebab_rusak',
        'pic_instal',
        'pic_rusak',
        'serial_number_battery',
        'photo_path',
        'cost',
        'notes',
    ];

    protected $casts = [
        'tanggal_instal' => 'date:Y-m-d',
        'tanggal_rusak' => 'date:Y-m-d',
        'hm_instal' => 'decimal:1',
        'hm_rusak' => 'decimal:1',
        'lifetime_hours' => 'decimal:1',
        'target_lifetime_hours' => 'decimal:1',
        'qty' => 'integer',
        'cost' => 'decimal:2',
    ];

    protected $appends = [
        'photo_url',
        'current_lifetime',
        'lifetime_percentage',
        'is_alert',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $battery) {
            // Auto calculate lifetime_hours if hm_rusak is provided
            if ($battery->hm_rusak !== null && is_numeric($battery->hm_rusak)) {
                $battery->lifetime_hours = max(0, (float) $battery->hm_rusak - (float) $battery->hm_instal);
            }
        });
    }

    /**
     * Unit relationship
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Public photo URL accessor
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }

    /**
     * Running lifetime calculation
     */
    public function getCurrentLifetimeAttribute(): float
    {
        if ($this->status === 'TERPASANG' && $this->unit && $this->unit->hm) {
            return max(0, (float) $this->unit->hm - (float) $this->hm_instal);
        }

        return (float) ($this->lifetime_hours ?? 0);
    }

    /**
     * Lifetime percentage against target
     */
    public function getLifetimePercentageAttribute(): float
    {
        $target = (float) ($this->target_lifetime_hours ?: 4000);
        if ($target <= 0) {
            return 0;
        }

        return round(($this->current_lifetime / $target) * 100, 1);
    }

    /**
     * Alert indicator if active battery exceeds or approaches 90% of target lifetime
     */
    public function getIsAlertAttribute(): bool
    {
        return $this->status === 'TERPASANG' && $this->lifetime_percentage >= 90.0;
    }
}
