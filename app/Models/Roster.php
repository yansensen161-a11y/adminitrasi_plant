<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Roster extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'shifts' => 'array',
    ];
}
