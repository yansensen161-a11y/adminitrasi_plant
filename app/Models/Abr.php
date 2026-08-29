<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Abr extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'no_abr',
        'tanggal',
        'unit_id',
        'lokasi_site',
        'lokasi_perbaikan',
        'hm',
        'inspected_by',
        'incident_description',
        'total_biaya',
        'tax_amount',
        'grand_total',
        'dibuat_oleh',
        'dibuat_jabatan',
        'checked_by',
        'checked_jabatan',
        'disetujui_oleh',
        'disetujui_jabatan',
        'diketahui_oleh',
        'diketahui_jabatan',
        'status',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'hm' => 'float',
        'total_biaya' => 'float',
        'tax_amount' => 'float',
        'grand_total' => 'float',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function items()
    {
        return $this->hasMany(AbrItem::class);
    }

    public function images()
    {
        return $this->hasMany(AbrImage::class);
    }
}
