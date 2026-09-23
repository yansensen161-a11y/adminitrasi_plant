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
        Schema::table('wo_outside_repairs', function (Blueprint $table) {
            $table->decimal('estimasi_biaya', 15, 2)->nullable()->default(0)->change();
            $table->decimal('aktual_biaya', 15, 2)->nullable()->default(0)->change();
            $table->integer('garansi_bulan')->nullable()->default(1)->change();
            $table->decimal('smr_hours', 10, 2)->nullable()->default(0)->change();
            $table->decimal('prev_smr_hours', 10, 2)->nullable()->default(0)->change();
            $table->decimal('lifetime_hours', 10, 2)->nullable()->default(0)->change();
            $table->decimal('target_lifetime', 10, 2)->nullable()->default(5000)->change();
            $table->integer('qty')->nullable()->default(1)->change();
            $table->string('dibuat_oleh')->nullable()->default('Admin Plant')->change();
            $table->string('diketahui_oleh')->nullable()->default('Planner')->change();
            $table->string('disetujui_oleh')->nullable()->default('Superintendent Plant')->change();
            $table->string('dikirim_oleh')->nullable()->default('Logistic')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
