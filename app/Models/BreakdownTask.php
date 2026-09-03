<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BreakdownTask extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'breakdown_id',
        'task_no',
        'problem',
        'activity',
        'status',
        'remarks',
        'mol',
        'pr',
        'po',
        'eta',
    ];

    public function breakdown()
    {
        return $this->belongsTo(Breakdown::class);
    }
}
