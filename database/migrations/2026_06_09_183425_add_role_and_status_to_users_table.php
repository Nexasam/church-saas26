<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Nullable so existing rows don't break before seeding
            $table->foreignId('role_id')->nullable()->after('church_id')->constrained('roles')->nullOnDelete();
            $table->boolean('is_super_admin')->default(false)->after('role_id');
            $table->string('status')->default('active')->after('is_super_admin'); // active | suspended | pending
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'is_super_admin', 'status', 'last_login_at']);
        });
    }
};
