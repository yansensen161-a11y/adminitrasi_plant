<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FailureAnalysis extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'no_far',
        'status',
        'tgl_kejadian',
        'tgl_lapor',
        'pelapor_id',

        'unit_id',
        'site_project',
        'unit_model',
        'unit_sn',
        'smu_failure',

        'part_no',
        'nama_komp',
        'pn',
        'penyebab',
        'engine_model',
        'engine_sn',

        'comp_installed',
        'comp_hours',
        'oil_sampled',
        'oil_eval',

        'failure_outline',
        'background',
        'failure_analysis',
        'conclusion',

        'prepared_by',
        'reviewed_by',
        'approved_by',
    ];

    public function pelapor()
    {
        return $this->belongsTo(User::class, 'pelapor_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function photos()
    {
        return $this->hasMany(FailureAnalysisPhoto::class, 'failure_analysis_id');
    }
}
