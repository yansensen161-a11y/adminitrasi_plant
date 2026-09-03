<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'no_so',
        'tanggal',
        'unit_id',
        'lokasi',
        'department',
        'priority',
        'status',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
