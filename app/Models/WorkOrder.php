<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_wo', 'tipe_wo', 'downtime_code', 'site', 'unit_id',
        'waktu_breakdown', 'waktu_rfu', 'durasi_hrs', 'hm_unit', 'hm_bd', 'hm_rfu',
        'status_wo', 'status_pengerjaan', 'keterangan', 'priority', 'request_date',
        'request_by', 'problem',
        'department', 'location', 'failure_description', 'job_instruction',
        'component', 'component_model', 'component_sn',
        'maintenance_type', 'planner', 'supervisor', 'pic', 'vendor',
        'schedule_date', 'start_date', 'finish_date', 'close_date',
        'estimated_job', 'actual_job', 'root_cause', 'corrective_action', 'remark',
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
