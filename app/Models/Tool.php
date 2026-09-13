<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    protected $fillable = [
        'tool_code', 'name', 'brand', 'category', 'specifications',
        'location', 'condition', 'status', 'qty',
        'purchase_date', 'purchase_price', 'notes', 'image',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(ToolTransaction::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(ToolInspection::class);
    }

    public function gatePasses(): HasMany
    {
        return $this->hasMany(ToolGatePass::class);
    }

    public function activeBorrow(): ?ToolTransaction
    {
        return $this->transactions()->where('status', 'BORROWED')->latest()->first();
    }
}
