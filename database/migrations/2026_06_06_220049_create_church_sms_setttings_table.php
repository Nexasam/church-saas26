<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('church_sms_settings', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
        
            $table->string('provider'); 
            // termii, smsbulk, twilio
        
            $table->json('config')->nullable(); 
            // api_key, sender_id (per church if needed)
        
            $table->boolean('is_active')->default(true);
        
            $table->timestamps();
        
            $table->unique(['church_id', 'is_active']); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('church_sms_setttings');
    }
};
