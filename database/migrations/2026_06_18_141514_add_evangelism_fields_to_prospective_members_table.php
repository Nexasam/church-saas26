<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prospective_members', function (Blueprint $table) {
            $table->string('location')->nullable()->after('email');
            $table->date('date_won')->nullable()->after('location');
            $table->enum('stage', [
                'soul_won', 'visited', 'membership_class', 'worker', 'established'
            ])->default('soul_won')->after('date_won');
            $table->text('notes')->nullable()->after('stage');
            // Track if converted to full member
            $table->foreignId('converted_member_id')
                  ->nullable()
                  ->constrained('members')
                  ->nullOnDelete()
                  ->after('notes');
            $table->timestamp('converted_at')->nullable()->after('converted_member_id');
            $table->string('membership_type')->default('full')->after('converted_at');
        });
    }

    public function down(): void
    {
        Schema::table('prospective_members', function (Blueprint $table) {
            $table->dropForeign(['converted_member_id']);
            $table->dropColumn(['location', 'date_won', 'stage', 'notes', 'converted_member_id', 'converted_at', 'membership_type']);
        });
    }
};
