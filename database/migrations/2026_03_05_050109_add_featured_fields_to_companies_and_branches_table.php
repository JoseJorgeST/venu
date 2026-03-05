<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->integer('featured_order')->default(0)->after('is_featured');
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->integer('featured_order')->default(0)->after('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['is_featured', 'featured_order']);
        });

        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['is_featured', 'featured_order']);
        });
    }
};
