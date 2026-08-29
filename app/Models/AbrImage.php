<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbrImage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'abr_id',
        'file_path',
    ];

    public function abr()
    {
        return $this->belongsTo(Abr::class);
    }
}
