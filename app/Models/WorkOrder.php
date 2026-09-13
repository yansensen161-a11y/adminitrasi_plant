<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_wo', 'tipe_wo', 'downtime_code', 'site', 'unit_id',
        'waktu_breakdown', 'waktu_rfu', 'durasi_hrs', 'hm_unit',
        'status_wo', 'keterangan', 'priority', 'request_date',
        'request_by', 'problem', 'progress_percentage',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tasks()
    {
        return $this->hasMany(WorkOrderTask::class);
    }

    public function breakdownDetails()
    {
        return $this->hasOne(WoBreakdown::class);
    }

    public function parts()
    {
        return $this->hasMany(WoPart::class);
    }

    public function manpowers()
    {
        return $this->hasMany(WoManpower::class);
    }

    public function vendors()
    {
        return $this->hasMany(WoVendor::class);
    }

    public function warranties()
    {
        return $this->hasMany(WoWarranty::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(WoStatusHistory::class);
    }
}
