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
        // database/migrations/2024_01_01_000005_create_charges_table.php
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('libelle', 100);
            $table->string('categorie', 50)->nullable(); // Loyer, Internet, École...
            $table->decimal('montant', 10, 2);
            $table->unsignedTinyInteger('jour_echeance');           // jour du mois 1-28
            $table->unsignedTinyInteger('mois');                    // mois de l'occurrence
            $table->unsignedSmallInteger('annee');                  // année de l'occurrence
            $table->enum('statut', ['en_attente', 'payee', 'en_retard'])->default('en_attente');
            $table->date('date_paiement')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charges');
    }
};
