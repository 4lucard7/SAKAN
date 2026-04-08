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
        // database/migrations/2024_01_01_000003_create_voiture_table.php
        Schema::create('voiture', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('car_name', 100);
            $table->unsignedInteger('current_km')->default(0);
            // Responsabilités administratives
            $table->date('assurance_expiry')->nullable();
            $table->date('vignette_expiry')->nullable();
            $table->date('controle_technique_expiry')->nullable();
            $table->date('carte_grise_expiry')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voiture');
    }
};
