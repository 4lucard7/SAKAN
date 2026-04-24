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
        Schema::table('voiture_maintenance', function (Blueprint $table) {
            if (!Schema::hasColumn('voiture_maintenance', 'is_required')) {
                $table->boolean('is_required')->default(false)->after('notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voiture_maintenance', function (Blueprint $table) {
            $table->dropColumn('is_required');
        });
    }
};
