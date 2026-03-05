<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->string('stripe_key')->nullable()->after('email');
            $table->string('stripe_secret')->nullable()->after('stripe_key');
            $table->string('stripe_webhook_secret')->nullable()->after('stripe_secret');
            $table->boolean('stripe_enabled')->default(false)->after('stripe_webhook_secret');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['stripe_key', 'stripe_secret', 'stripe_webhook_secret', 'stripe_enabled']);
        });
    }
};
