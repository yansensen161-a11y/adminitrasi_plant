<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolInspection extends Model
{
    protected $fillable = [
        'tool_id', 'inspection_date', 'inspector_name', 'condition',
        'calibration_status', 'calibration_due_date', 'findings', 'action_taken', 'notes', 'attachment',
    ];

    protected $casts = [
        'inspection_date' => 'date',
        'calibration_due_date' => 'date',
    ];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
