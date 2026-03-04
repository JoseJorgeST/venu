<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('rejection_reason', 100)->nullable()->after('status');
            $table->text('admin_message')->nullable()->after('rejection_reason');
            $table->date('alternative_date')->nullable()->after('admin_message');
            $table->string('alternative_time', 10)->nullable()->after('alternative_date');
            $table->timestamp('responded_at')->nullable()->after('alternative_time');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'rejection_reason',
                'admin_message',
                'alternative_date',
                'alternative_time',
                'responded_at',
            ]);
        });
    }
};
