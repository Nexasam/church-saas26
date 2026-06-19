<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_attendances', function (Blueprint $table) {
            $table->enum('status', ['present', 'absent', 'excused'])
                  ->default('present')
                  ->after('service_name');
            $table->string('marked_by')->nullable()->after('status'); // name of who marked it
        });
    }

    public function down(): void
    {
        Schema::table('service_attendances', function (Blueprint $table) {
            $table->dropColumn(['status', 'marked_by']);
        });
    }
};
