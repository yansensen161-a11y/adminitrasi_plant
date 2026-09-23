<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkOrderTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'group_component',
        'component',
        'task_description',
        'problem',
        'activity_progress',
        'est_finish',
        'mechanic',
        'tools',
        'start_date',
        'end_date',
        'downtime_hrs',
        'target_date',
        'status',
        'mol',
        'pr',
        'po',
        'eta',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'downtime_hrs' => 'decimal:2',
        'target_date' => 'datetime',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
