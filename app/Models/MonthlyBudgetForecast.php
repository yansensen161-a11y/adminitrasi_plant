<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyBudgetForecast extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'tab',
        'code_unit',
        'type_unit',
        'hm',
        'no',
        'code_budget',
        'cost_element',
        'code_depart',
        'uraian',
        'std_qty',
        'forecast_qty',
        'satuan',
        'unit_rate',
        'amount',
    ];

    protected $casts = [
        'year' => 'integer',
        'no' => 'integer',
        'unit_rate' => 'float',
        'amount' => 'float',
    ];
}
