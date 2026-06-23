<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->string('description')->nullable()->after('name');
            $table->string('icon')->default('Users')->after('description');
            $table->string('color')->default('blue')->after('icon');
            $table->string('leader')->nullable()->after('color');
            $table->foreignId('leader_id')->nullable()->constrained('members')->nullOnDelete()->after('leader');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['leader_id']);
            $table->dropColumn(['description', 'icon', 'color', 'leader', 'leader_id']);
        });
    }
};
