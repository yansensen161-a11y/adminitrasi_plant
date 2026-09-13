<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FailureAnalysisPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'failure_analysis_id',
        'komponen_bagian',
        'observasi',
        'foto_path',
    ];

    public function failureAnalysis()
    {
        return $this->belongsTo(FailureAnalysis::class, 'failure_analysis_id');
    }
}
