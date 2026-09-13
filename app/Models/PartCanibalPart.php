<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartCanibalPart extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'part_canibal_id',
        'part_name',
        'description',
        'qty',
        'component',
        'life_time',
    ];

    public function partCanibal()
    {
        return $this->belongsTo(PartCanibal::class, 'part_canibal_id');
    }
}
