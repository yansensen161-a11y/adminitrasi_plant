<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Backlog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'unit_id',
        'lokasi',
        'tipe_service',
        'temuan',
        'part_diperlukan',
        'tindakan_mekanik',
        'tingkat_backlog',
        'target_pasang',
        'tanggal_temuan',
        'status',
    ];

    protected $casts = [
        'tanggal_temuan' => 'date',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
