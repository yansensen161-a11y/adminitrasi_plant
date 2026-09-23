<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('unit_gate_passes', function (Blueprint $table) {
            $table->string('company_name')->default('PT. MITRA ABADI MAHAKAM')->after('gatepass_no');
            $table->string('transfer_type')->default('STOCK TRANSFER - NOT FOR SALE OR RESALE')->after('company_name');
            $table->string('cst_no')->default('N/A')->after('transfer_type');
            $table->string('lst_no')->default('N/A')->after('cst_no');
            $table->string('st_form_no')->default('N/A')->after('lst_no');

            // FROM
            $table->string('from_company')->default('PT. MITRA ABADI MAHAKAM')->after('st_form_no');
            $table->string('from_location')->default('HARINDO WAHANA - KUBAR SAMARINDA KALTIM')->after('from_company');

            // TO
            $table->string('to_company')->default('PT. MITRA ABADI MAHAKAM')->after('from_location');
            $table->string('to_location')->default('Mining Project SATUI - SUNGAI DANAU')->after('to_company');
            $table->string('kind_attn')->default('Mr. Supardi Halim')->after('to_location');

            // Right Box Details
            $table->string('person_name')->nullable()->after('kind_attn');
            $table->string('mob_no')->nullable()->after('person_name');
            $table->string('receiver_name')->nullable()->after('mob_no');
            $table->string('wt_material')->nullable()->after('receiver_name');
            $table->string('approx_value')->nullable()->after('wt_material');
            $table->string('gate')->default('Gate 1')->nullable()->after('approx_value');

            // Items & Spec Details
            $table->string('unit_measure')->default('Unit')->after('code_unit');
            $table->integer('qty_despatch')->default(1)->after('unit_measure');
            $table->integer('qty_recd')->nullable()->after('qty_despatch');
            $table->string('engine_make')->nullable()->after('qty_recd');
            $table->string('engine_model')->nullable()->after('engine_make');
            $table->string('sn_engine')->nullable()->after('engine_model');
            $table->string('starter_alternator')->default('Alongwith Starter, Alternator')->nullable()->after('sn_engine');
            $table->string('battery_spec')->default('Battery 12 Volts')->nullable()->after('starter_alternator');
            $table->string('battery_model')->default('Make:-N/Av Model:- AMARON 120AH')->nullable()->after('battery_spec');
            $table->integer('battery_qty')->default(2)->after('battery_model');
            $table->json('items_json')->nullable()->after('battery_qty');

            // Checklist & Remarks Details
            $table->string('fuel_level')->default('Diesel Fuul Tank')->nullable()->after('items_json');
            $table->string('oil_level')->default('Oil Level ok')->nullable()->after('fuel_level');
            $table->string('hr_mtr')->nullable()->after('oil_level');
            $table->string('battery_condition')->default('Condition ok')->nullable()->after('hr_mtr');
            $table->string('battery_performance')->default('Performance :- Good')->nullable()->after('battery_condition');
            $table->string('parts_missing')->default('NIL')->nullable()->after('battery_performance');
            $table->string('radio_rig')->default('Radio Rig not Available')->nullable()->after('parts_missing');
            $table->string('general_condition')->default('Condition ok')->nullable()->after('radio_rig');
            $table->string('apar_1')->default('APAR Available')->nullable()->after('general_condition');
            $table->string('apar_2')->default('APAR Available')->nullable()->after('apar_1');
            $table->string('next_service_hm')->default('250')->nullable()->after('apar_2');
            $table->json('remarks_json')->nullable()->after('next_service_hm');

            // Signatures
            $table->string('approved_by_name')->default('Supardi Halim')->nullable()->after('remarks_json');
            $table->string('approved_by_title')->default('Project Manager')->nullable()->after('approved_by_name');
            $table->string('issued_by_name')->nullable()->after('approved_by_title');
            $table->string('issued_by_title')->nullable()->after('issued_by_name');
            $table->string('checked_by_name')->default('Ambo Mai')->nullable()->after('issued_by_title');
            $table->string('checked_by_title')->default('Plant Superintendent')->nullable()->after('checked_by_name');
            $table->string('received_by_name')->nullable()->after('checked_by_title');
            $table->string('received_by_title')->nullable()->after('received_by_name');

            $table->date('despatch_date')->nullable()->after('received_by_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit_gate_passes', function (Blueprint $table) {
            $table->dropColumn([
                'company_name', 'transfer_type', 'cst_no', 'lst_no', 'st_form_no',
                'from_company', 'from_location', 'to_company', 'to_location', 'kind_attn',
                'person_name', 'mob_no', 'receiver_name', 'wt_material', 'approx_value', 'gate',
                'unit_measure', 'qty_despatch', 'qty_recd',
                'engine_make', 'engine_model', 'sn_engine', 'starter_alternator',
                'battery_spec', 'battery_model', 'battery_qty', 'items_json',
                'fuel_level', 'oil_level', 'hr_mtr', 'battery_condition', 'battery_performance',
                'parts_missing', 'radio_rig', 'general_condition', 'apar_1', 'apar_2', 'next_service_hm',
                'remarks_json',
                'approved_by_name', 'approved_by_title', 'issued_by_name', 'issued_by_title',
                'checked_by_name', 'checked_by_title', 'received_by_name', 'received_by_title',
                'despatch_date',
            ]);
        });
    }
};
