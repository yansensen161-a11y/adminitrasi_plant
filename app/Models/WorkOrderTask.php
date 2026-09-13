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
        'mechanic',
        'tools'
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
