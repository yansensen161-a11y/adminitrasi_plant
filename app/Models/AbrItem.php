<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbrItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'abr_id',
        'category',
        'part_number',
        'description',
        'price',
        'qty',
        'satuan',
        'hour',
        'mp',
        'amount',
    ];

    protected $casts = [
        'price' => 'float',
        'qty' => 'float',
        'hour' => 'float',
        'mp' => 'float',
        'amount' => 'float',
    ];

    public function abr()
    {
        return $this->belongsTo(Abr::class);
    }
}
