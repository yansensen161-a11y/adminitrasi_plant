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
        'attachments',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)
            ->orWhere('no_order', $value)
            ->firstOrFail();
    }

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

    /**
     * Generate next WO Number in format: HW-MOL-01502
     */
    public static function generateNextNoOrder(?string $tanggal = null): string
    {
        $currentYear = $tanggal ? date('Y', strtotime($tanggal)) : date('Y');

        $lastOrder = self::whereYear('tanggal', $currentYear)
            ->where('no_order', 'like', 'HW-MOL-%')
            ->orderBy('no_order', 'desc')
            ->first();

        $nextSequence = 1439;
        if ($lastOrder && preg_match('/HW-MOL-(\d+)/', $lastOrder->no_order, $matches)) {
            $lastSequence = (int) $matches[1];
            $nextSequence = max($lastSequence + 1, 1439);
        }

        return 'HW-MOL-'.str_pad((string) $nextSequence, 5, '0', STR_PAD_LEFT);
    }
}
