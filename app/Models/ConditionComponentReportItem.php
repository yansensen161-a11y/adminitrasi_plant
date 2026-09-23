<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ConditionComponentReportItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'item_no',
        'remarks',
        'picture_path',
    ];

    protected $appends = [
        'picture_url',
    ];

    public function report()
    {
        return $this->belongsTo(ConditionComponentReport::class, 'report_id');
    }

    public function getPictureUrlAttribute(): ?string
    {
        if (! $this->picture_path) {
            return null;
        }

        if (str_starts_with($this->picture_path, 'http://') || str_starts_with($this->picture_path, 'https://')) {
            return $this->picture_path;
        }

        return Storage::url($this->picture_path);
    }
}
