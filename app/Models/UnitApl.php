<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitApl extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'qty' => 'float',
        'price_rate' => 'float',
        'amount' => 'float',
        'is_global' => 'boolean',
    ];

    protected $appends = [
        'total_price',
    ];

    public function getTotalPriceAttribute(): float
    {
        return (float) (($this->qty ?: 1) * ($this->price_rate ?: 0));
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
