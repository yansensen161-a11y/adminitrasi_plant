<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class HourMeterLog extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'unit_id',
        'code_unit',
        'log_date',
        'hm_start',
        'hm_end',
        'hm_total',
        'shift',
        'operator_name',
        'location',
        'remarks',
    ];

    protected $casts = [
        'log_date' => 'date:Y-m-d',
        'hm_start' => 'float',
        'hm_end' => 'float',
        'hm_total' => 'float',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
