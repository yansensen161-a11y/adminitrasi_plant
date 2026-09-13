<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tyres', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number')->unique();
            $table->string('brand');
            $table->string('type_size')->nullable();          // e.g. 27.00R49, 14.00-25
            $table->enum('condition', ['ACTIVE', 'REPAIR', 'SCRAP', 'STOCK'])->default('STOCK');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            // Current mounting info
            $table->foreignUuid('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('position', ['FL','FR','RL','RR','RLI','RLO','RRI','RRO','SP','SPARE'])->nullable();
            $table->decimal('installed_hm', 10, 2)->default(0);  // HM when installed
            $table->decimal('total_hm', 10, 2)->default(0);       // Accumulated HM
            $table->decimal('installed_km', 10, 2)->default(0);
            $table->decimal('total_km', 10, 2)->default(0);
            $table->string('tread_depth_new')->nullable();
            $table->string('tread_depth_current')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tyres');
    }
};
