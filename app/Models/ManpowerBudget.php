<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManpowerBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'job_position',
        'plan_mp',
        'tersedia',
        'remarks',
    ];

    public function getDeviasiAttribute()
    {
        return $this->tersedia - $this->plan_mp;
    }
}
