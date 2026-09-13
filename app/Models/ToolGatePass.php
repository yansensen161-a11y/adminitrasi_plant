<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolGatePass extends Model
{
    protected $fillable = [
        'pass_number', 'tool_id', 'type', 'date', 'pic',
        'destination', 'reason', 'status', 'approved_by',
        'return_date', 'is_returned', 'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'return_date' => 'date',
        'is_returned' => 'boolean',
    ];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
