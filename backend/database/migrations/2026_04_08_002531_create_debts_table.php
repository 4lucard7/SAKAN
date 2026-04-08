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
        // database/migrations/2024_01_01_000002_create_debts_table.php
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tier_id')->constrained('tiers')->cascadeOnDelete();
            $table->decimal('total_prete', 10, 2);
            $table->decimal('total_rembourse', 10, 2)->default(0.00);
            $table->decimal('reste', 10, 2)->default(0.00); // calculé: total_prete - total_rembourse
            $table->enum('type', ['outflow', 'inflow']); // outflow=dette | inflow=créance
            $table->enum('statut', ['en_cours', 'partiellement_solde', 'solde', 'en_retard'])->default('en_cours');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
