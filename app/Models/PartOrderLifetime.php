<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartOrderLifetime extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'unit_id',
        'unit_code',
        'part_number',
        'part_name',
        'no_order',
        'maintenance_order_id',
        'maintenance_order_part_id',
        'qty',
        'order_date',
        'eta',
        'received_date',
        'installed_date',
        'installed_hm',
        'removed_date',
        'removed_hm',
        'expected_lifetime',
        'actual_lifetime',
        'failure_reason',
        'status',
        'replacement_order_id',
        'remarks',
    ];

    protected $casts = [
        'order_date' => 'date:Y-m-d',
        'eta' => 'date:Y-m-d',
        'received_date' => 'date:Y-m-d',
        'installed_date' => 'date:Y-m-d',
        'removed_date' => 'date:Y-m-d',
        'installed_hm' => 'decimal:1',
        'removed_hm' => 'decimal:1',
        'expected_lifetime' => 'decimal:1',
        'actual_lifetime' => 'decimal:1',
        'qty' => 'integer',
    ];

    protected $appends = [
        'current_life',
        'remaining_life',
        'life_used_percentage',
        'lifetime_status',
        'is_active_order',
        'is_overdue_eta',
    ];

    public const STATUS_REQUEST = 'REQUEST';

    public const STATUS_PR_CREATED = 'PR CREATED';

    public const STATUS_PO_PROCESS = 'PO PROCESS';

    public const STATUS_ORDERED = 'ORDERED';

    public const STATUS_DELIVERY = 'DELIVERY';

    public const STATUS_RECEIVED = 'RECEIVED';

    public const STATUS_INSTALLED = 'INSTALLED';

    public const STATUS_CLOSED = 'CLOSED';

    public const STATUS_CANCELLED = 'CANCELLED';

    public const ALL_STATUSES = [
        self::STATUS_REQUEST,
        self::STATUS_PR_CREATED,
        self::STATUS_PO_PROCESS,
        self::STATUS_ORDERED,
        self::STATUS_DELIVERY,
        self::STATUS_RECEIVED,
        self::STATUS_INSTALLED,
        self::STATUS_CLOSED,
        self::STATUS_CANCELLED,
    ];

    public const ACTIVE_ORDER_STATUSES = [
        self::STATUS_REQUEST,
        self::STATUS_PR_CREATED,
        self::STATUS_PO_PROCESS,
        self::STATUS_ORDERED,
        self::STATUS_DELIVERY,
        self::STATUS_RECEIVED,
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function maintenanceOrder(): BelongsTo
    {
        return $this->belongsTo(MaintenanceOrder::class, 'maintenance_order_id');
    }

    public function maintenanceOrderPart(): BelongsTo
    {
        return $this->belongsTo(MaintenanceOrderPart::class, 'maintenance_order_part_id');
    }

    public function replacementOrder(): BelongsTo
    {
        return $this->belongsTo(PartOrderLifetime::class, 'replacement_order_id');
    }

    /**
     * Current Life = Current HM - Installed HM
     */
    public function getCurrentLifeAttribute(): float
    {
        if ($this->installed_hm === null) {
            return 0.0;
        }

        if ($this->removed_hm !== null) {
            return (float) ($this->actual_lifetime ?? max(0, (float) $this->removed_hm - (float) $this->installed_hm));
        }

        $unitHm = $this->unit ? (float) ($this->unit->hm ?? 0) : null;
        if ($unitHm !== null && $unitHm >= (float) $this->installed_hm) {
            return round($unitHm - (float) $this->installed_hm, 1);
        }

        return 0.0;
    }

    /**
     * Remaining Life = Expected Life - Current Life
     */
    public function getRemainingLifeAttribute(): float
    {
        $expected = (float) ($this->expected_lifetime ?? 5000.0);
        $remaining = $expected - $this->current_life;

        return round(max(0, $remaining), 1);
    }

    /**
     * Life Used % = (Current Life / Expected Life) * 100
     */
    public function getLifeUsedPercentageAttribute(): float
    {
        $expected = (float) ($this->expected_lifetime ?? 5000.0);
        if ($expected <= 0) {
            return 0.0;
        }

        return round(($this->current_life / $expected) * 100, 1);
    }

    /**
     * Indicator:
     * 🟢 Normal (< 85%)
     * 🟡 Near Lifetime (85% - 100% or Remaining Life <= 200 HM)
     * 🔴 Critical/Exceeded (> 100% or Remaining Life <= 0)
     */
    public function getLifetimeStatusAttribute(): string
    {
        if ($this->status !== self::STATUS_INSTALLED) {
            return in_array($this->status, self::ACTIVE_ORDER_STATUSES) ? 'ORDER_IN_PROGRESS' : 'CLOSED';
        }

        $pct = $this->life_used_percentage;
        $rem = $this->remaining_life;

        if ($pct >= 100.0 || $rem <= 0) {
            return 'CRITICAL';
        }

        if ($pct >= 85.0 || $rem <= 200) {
            return 'NEAR_LIFETIME';
        }

        return 'NORMAL';
    }

    public function getIsActiveOrderAttribute(): bool
    {
        return in_array($this->status, self::ACTIVE_ORDER_STATUSES, true);
    }

    public function getIsOverdueEtaAttribute(): bool
    {
        if (! $this->is_active_order || ! $this->eta) {
            return false;
        }

        return Carbon::parse($this->eta)->isPast();
    }

    /**
     * Average actual lifetime for this part number from closed/replaced historical records
     */
    public static function getAverageLifetime(string $partNumber, ?string $unitId = null): ?float
    {
        $query = static::where('part_number', strtoupper(trim($partNumber)))
            ->whereNotNull('actual_lifetime')
            ->where('actual_lifetime', '>', 0);

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $avg = $query->avg('actual_lifetime');

        return $avg ? round((float) $avg, 1) : null;
    }
}
