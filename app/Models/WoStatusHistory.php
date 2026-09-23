<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WoStatusHistory extends Model
{
    protected $guarded = [];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
