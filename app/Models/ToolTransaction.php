<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolTransaction extends Model
{
    protected $fillable = [
        'transaction_code', 'tool_id', 'mechanic_name', 'mechanic_badge',
        'work_order_no', 'borrow_date', 'expected_return_date', 'return_date',
        'returned_condition', 'status', 'purpose', 'notes', 'approved_by',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'expected_return_date' => 'date',
        'return_date' => 'date',
    ];

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
