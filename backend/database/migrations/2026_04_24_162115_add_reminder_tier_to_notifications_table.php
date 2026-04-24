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
        Schema::table('notifications', function (Blueprint $table) {
            // Track which reminder tier was sent (3_days, 1_day, same_day, overdue, etc.)
            $table->string('reminder_tier', 30)->nullable()->after('reference_id');

            // Composite index to prevent duplicate notifications per entity per tier
            $table->unique(
                ['user_id', 'reference_type', 'reference_id', 'reminder_tier'],
                'notif_dedup_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropUnique('notif_dedup_unique');
            $table->dropColumn('reminder_tier');
        });
    }
};
