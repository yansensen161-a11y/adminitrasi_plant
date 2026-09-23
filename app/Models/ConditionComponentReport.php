<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConditionComponentReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_no',
        'project',
        'location',
        'date_reported',
        'reported_by',
        'company_name',
        'unit_id',
        'unit_code',
        'model',
        'serial_no',
        'date_install',
        'hm_install',
        'date_failure',
        'hm_failure',
        'life_time_days',
        'hm_life',
        'dibuat_oleh',
        'disetujui_oleh',
        'diketahui_oleh',
        'status',
    ];

    protected $casts = [
        'date_reported' => 'date',
        'date_install' => 'date',
        'date_failure' => 'date',
        'hm_install' => 'float',
        'hm_failure' => 'float',
        'life_time_days' => 'integer',
        'hm_life' => 'float',
    ];

    protected static function booted(): void
    {
        static::saving(function ($report) {
            // Auto calculate life time days
            if ($report->date_install && $report->date_failure) {
                $install = Carbon::parse($report->date_install);
                $failure = Carbon::parse($report->date_failure);
                $report->life_time_days = max(0, $install->diffInDays($failure, false));
            }

            // Auto calculate HM life
            if ($report->hm_failure !== null && $report->hm_install !== null) {
                $report->hm_life = max(0, round((float) $report->hm_failure - (float) $report->hm_install, 2));
            }
        });
    }

    public function items()
    {
        return $this->hasMany(ConditionComponentReportItem::class, 'report_id')->orderBy('item_no', 'asc');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
