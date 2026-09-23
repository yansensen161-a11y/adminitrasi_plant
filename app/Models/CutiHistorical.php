<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CutiHistorical extends Model
{
    protected $guarded = ['id'];

    public function manpower()
    {
        return $this->belongsTo(Manpower::class);
    }
}
