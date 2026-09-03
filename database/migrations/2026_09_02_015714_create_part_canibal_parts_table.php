<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('part_canibal_parts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_canibal_id')->constrained('part_canibals')->cascadeOnDelete();
            $table->string('part_name');
            $table->text('description')->nullable();
            $table->integer('qty')->default(1);
            $table->timestamps();
        });

        // Migrate existing data
        $canibals = DB::table('part_canibals')->get();
        foreach ($canibals as $canibal) {
            DB::table('part_canibal_parts')->insert([
                'id' => (string) Str::uuid(),
                'part_canibal_id' => $canibal->id,
                'part_name' => $canibal->part_name,
                'description' => $canibal->description,
                'qty' => $canibal->qty,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_canibal_parts');
    }
};
