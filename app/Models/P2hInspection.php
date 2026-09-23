<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class P2hInspection extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'closed_at' => 'date',
        'checklist_data' => 'array',
        'hm' => 'decimal:1',
        'total_item_ok' => 'integer',
        'total_item_caution' => 'integer',
        'total_item_abnormal' => 'integer',
        'total_item_total' => 'integer',
    ];

    protected $appends = ['aging_days', 'image_url'];

    public function getAgingDaysAttribute(): int
    {
        if (! $this->date) {
            return 0;
        }

        $startDate = Carbon::parse($this->date)->startOfDay();
        $endDate = $this->status === 'CLOSED' && $this->closed_at
            ? Carbon::parse($this->closed_at)->startOfDay()
            : now()->startOfDay();

        return (int) max(0, $startDate->diffInDays($endDate));
    }

    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return asset('storage/'.$this->image);
    }

    protected static function booted(): void
    {
        static::creating(function ($inspection) {
            if (empty($inspection->wo_number)) {
                $inspection->wo_number = self::generateNextWoNumber();
            }
        });
    }

    public static function generateNextWoNumber(): string
    {
        $prefix = 'PLT/WO/INS/';
        $maxNum = self::where('wo_number', 'like', $prefix.'%')
            ->get(['wo_number'])
            ->map(function ($item) {
                if (preg_match('/PLT\/WO\/INS\/(\d+)/', (string) $item->wo_number, $matches)) {
                    return (int) $matches[1];
                }

                $parts = explode('/', (string) $item->wo_number);

                return (int) end($parts);
            })
            ->max();

        $nextNum = ((int) $maxNum) + 1;

        return $prefix.str_pad($nextNum, 3, '0', STR_PAD_LEFT);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
