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
        Schema::table('charges', function (Blueprint $table) {
            $table->boolean('is_required')->default(false)->after('actif');
        });

        Schema::table('debts', function (Blueprint $table) {
            $table->boolean('is_required')->default(false)->after('notes');
        });

        Schema::table('voiture_maintenance', function (Blueprint $table) {
            $table->boolean('is_required')->default(false)->after('notes');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->boolean('is_required')->default(false)->after('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });

        Schema::table('debts', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });

        Schema::table('voiture_maintenance', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });
    }
};
