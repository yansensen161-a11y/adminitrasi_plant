<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TyreHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tyre_id',
        'unit_id',
        'event_type',
        'from_position',
        'to_position',
        'hm_at_event',
        'km_at_event',
        'event_date',
        'performed_by',
        'notes',
    ];

    protected $casts = [
        'event_date' => 'date',
        'hm_at_event' => 'decimal:2',
        'km_at_event' => 'decimal:2',
    ];

    public function tyre()
    {
        return $this->belongsTo(Tyre::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
