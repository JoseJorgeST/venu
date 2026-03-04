<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed'");
    }
};
