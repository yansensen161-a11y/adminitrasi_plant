<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tyre_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tyre_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('event_type', ['INSTALL', 'ROTATE', 'REPAIR', 'SCRAP', 'REMOVE', 'STOCK']);
            $table->string('from_position')->nullable();
            $table->string('to_position')->nullable();
            $table->decimal('hm_at_event', 10, 2)->nullable();
            $table->decimal('km_at_event', 10, 2)->nullable();
            $table->date('event_date');
            $table->string('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tyre_histories');
    }
};
