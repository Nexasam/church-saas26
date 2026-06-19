<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('address')->nullable()->after('gender');
            $table->string('home_church')->nullable()->after('address'); // zone name string
            $table->string('profile_photo')->nullable()->after('home_church');
            $table->text('notes')->nullable()->after('profile_photo');
            $table->enum('follow_up_stage', [
                'visitor', 'first_contact', 'follow_up',
                'membership_class', 'worker', 'established',
            ])->default('visitor')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['address', 'home_church', 'profile_photo', 'notes', 'follow_up_stage']);
        });
    }
};
