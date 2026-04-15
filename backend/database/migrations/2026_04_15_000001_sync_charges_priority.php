<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('charges')->update([
            'priority' => DB::raw("CASE WHEN is_required THEN 'important' ELSE 'normal' END"),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed for data sync.
    }
};
