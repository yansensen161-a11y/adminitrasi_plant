<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitGatePass extends Model
{
    use HasFactory;

    protected $table = 'unit_gate_passes';

    protected $fillable = [
        'gatepass_no',
        'company_name',
        'transfer_type',
        'cst_no',
        'lst_no',
        'st_form_no',
        'from_company',
        'from_location',
        'to_company',
        'to_location',
        'kind_attn',
        'person_name',
        'mob_no',
        'receiver_name',
        'wt_material',
        'approx_value',
        'gate',

        // Unit Reference & Specs
        'unit_id',
        'code_unit',
        'type_unit',
        'model',
        'no_police',
        'unit_measure',
        'qty_despatch',
        'qty_recd',
        'engine_make',
        'engine_model',
        'sn_engine',
        'starter_alternator',
        'battery_spec',
        'battery_model',
        'battery_qty',
        'items_json',

        // Condition & Checklist Remarks
        'fuel_level',
        'oil_level',
        'hr_mtr',
        'battery_condition',
        'battery_performance',
        'parts_missing',
        'radio_rig',
        'general_condition',
        'apar_1',
        'apar_2',
        'next_service_hm',
        'remarks_json',

        // Signatures
        'approved_by_name',
        'approved_by_title',
        'issued_by_name',
        'issued_by_title',
        'checked_by_name',
        'checked_by_title',
        'received_by_name',
        'received_by_title',

        // Legacy / Generic compatibility
        'driver_name',
        'destination',
        'purpose',
        'exit_time',
        'expected_return_time',
        'actual_return_time',
        'status',
        'approved_by',
        'security_checkpoint',
        'remarks',
        'despatch_date',
    ];

    protected $casts = [
        'exit_time' => 'datetime',
        'expected_return_time' => 'datetime',
        'actual_return_time' => 'datetime',
        'despatch_date' => 'date',
        'items_json' => 'array',
        'remarks_json' => 'array',
        'qty_despatch' => 'integer',
        'qty_recd' => 'integer',
        'battery_qty' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
