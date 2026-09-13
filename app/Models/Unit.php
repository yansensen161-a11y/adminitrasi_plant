<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Unit extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'no_urut',
        'code_unit',
        'type_unit',
        'hm',
        'model',
        'sn_chassis',
        'engine_model',
        'sn_engine',
        'engine_make',
        'equipment_capacity',
        'no_police',
        'attachments',
        'hp',
        'kw',
        'tahun_perakitan',
        'received_date',
        'received_from',
        'location',
        'before_from',
        'remarks',
        'status',
    ];

    protected $casts = [
        'no_urut' => 'integer',
        'hm' => 'float',
        'tahun_perakitan' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function serviceLogs()
    {
        return $this->hasMany(ServiceLog::class);
    }

    public function lastService()
    {
        return $this->hasOne(ServiceLog::class)->where('status', 'completed')->latestOfMany('id');
    }

    public function nextService()
    {
        return $this->hasOne(ServiceLog::class)->where('status', 'scheduled')->latestOfMany('id');
    }

    public function abrs()
    {
        return $this->hasMany(Abr::class);
    }
}
