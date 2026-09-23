<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OilConsumption extends Model
{
    use HasFactory;

    protected $table = 'oil_consumptions';

    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'hm_prev' => 'float',
        'hm' => 'float',
        'hm_diff' => 'float',
        'pengisian' => 'float',
        'konsumsi' => 'float',
        'l_per_1000' => 'float',
        'batas_normal' => 'float',
    ];

    /**
     * Get the unit that owns this oil consumption record.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
