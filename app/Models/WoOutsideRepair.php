<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WoOutsideRepair extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_no',
        'date',
        'nama_bengkel',
        'tanggal_kirim',
        'estimasi_finish',
        'tanggal_kembali',
        'pic',
        'lokasi',
        'tanggal_kerusakan',
        'unit_id',
        'kode_unit',
        'model_mesin',
        'serial_no_unit',
        'nama_komponen',
        'model_komponen',
        'sn_komponen',
        'smr_hours',
        'prev_smr_hours',
        'lifetime_hours',
        'target_lifetime',
        'qty',
        'problem',
        'job_instruction',
        'photo_path',
        'status',
        'estimasi_biaya',
        'aktual_biaya',
        'garansi_bulan',
        'dibuat_oleh',
        'diketahui_oleh',
        'disetujui_oleh',
        'dikirim_oleh',
        'diterima_oleh',
        'notes',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'tanggal_kirim' => 'date:Y-m-d',
        'estimasi_finish' => 'date:Y-m-d',
        'tanggal_kembali' => 'date:Y-m-d',
        'tanggal_kerusakan' => 'date:Y-m-d',
        'smr_hours' => 'decimal:1',
        'prev_smr_hours' => 'decimal:1',
        'lifetime_hours' => 'decimal:1',
        'target_lifetime' => 'decimal:1',
        'qty' => 'integer',
        'estimasi_biaya' => 'decimal:2',
        'aktual_biaya' => 'decimal:2',
        'garansi_bulan' => 'integer',
    ];

    protected $appends = [
        'photo_url',
        'is_premature',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        if (str_starts_with($this->photo_path, 'http') || str_starts_with($this->photo_path, '/')) {
            return $this->photo_path;
        }

        return asset('storage/'.$this->photo_path);
    }

    public function getIsPrematureAttribute(): bool
    {
        $target = (float) ($this->target_lifetime ?: 5000);
        $life = (float) ($this->lifetime_hours ?: 0);

        return $life > 0 && $life < ($target * 0.7);
    }

    /**
     * Generate next WO Number in format: 0390/WO/HW/IX/2026
     */
    public static function generateNextWoNumber(?string $date = null, string $lokasi = 'HW'): string
    {
        $d = $date ? Carbon::parse($date) : Carbon::now();
        $year = $d->format('Y');
        $monthRoman = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV', 5 => 'V', 6 => 'VI',
            7 => 'VII', 8 => 'VIII', 9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII',
        ][(int) $d->format('m')] ?? 'IX';

        $lastRecord = self::whereYear('date', $year)->orderByDesc('id')->first();
        $seq = 1;

        if ($lastRecord && preg_match('/^(\d+)\//', $lastRecord->wo_no, $matches)) {
            $seq = ((int) $matches[1]) + 1;
        }

        $seqStr = str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
        $locStr = strtoupper($lokasi ?: 'HW');

        return "{$seqStr}/WO/{$locStr}/{$monthRoman}/{$year}";
    }
}
