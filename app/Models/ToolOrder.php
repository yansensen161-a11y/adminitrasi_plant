<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolOrder extends Model
{
    protected $fillable = [
        'order_number', 'tool_name', 'brand', 'specifications',
        'qty_requested', 'qty_received', 'unit', 'estimated_price',
        'pr_number', 'po_number', 'vendor', 'status',
        'request_date', 'eta_date', 'received_date',
        'requested_by', 'approved_by', 'notes',
    ];

    protected $casts = [
        'request_date' => 'date',
        'eta_date' => 'date',
        'received_date' => 'date',
        'estimated_price' => 'decimal:2',
    ];
}
