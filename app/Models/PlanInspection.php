<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanInspection extends Model
{
    protected $fillable = [
        'unit_id',
        'inspection_date',
        'category',
        'shift',
        'is_completed',
        'photo_path',
        'notes',
    ];

    protected $casts = [
        'inspection_date' => 'date:Y-m-d',
        'is_completed' => 'boolean',
    ];

    protected $appends = ['photo_url'];

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

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
