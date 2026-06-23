<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('email_care_cases')->default(true);
            $table->boolean('email_follow_ups')->default(true);
            $table->boolean('email_celebrations')->default(true);
            $table->boolean('email_sms')->default(false);
            $table->boolean('database_care_cases')->default(true);
            $table->boolean('database_follow_ups')->default(true);
            $table->boolean('database_celebrations')->default(true);
            $table->boolean('database_sms')->default(true);
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
