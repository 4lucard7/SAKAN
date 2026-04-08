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
        // database/migrations/2024_01_01_000004_create_voiture_maintenance_table.php
        Schema::create('voiture_maintenance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained('voiture')->cascadeOnDelete();
            $table->string('part_name', 100);
            $table->unsignedInteger('kilometrage_actuel');
            $table->unsignedInteger('limit_km')->nullable();       // seuil km prochain entretien
            $table->date('last_change_date');
            $table->unsignedTinyInteger('duration')->nullable();   // intervalle en mois
            $table->decimal('cout', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voiture_maintenance');
    }
};
