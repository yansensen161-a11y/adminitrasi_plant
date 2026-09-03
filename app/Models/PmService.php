<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PmService extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'nama_pm',
        'interval_hm',
        'type_service',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'interval_hm' => 'integer',
    ];
}
