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
        Schema::create('sms_recipients', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('sms_id')->constrained()->cascadeOnDelete();
        
            $table->foreignId('member_id')->nullable(); 
            // if tied to a member
        
            $table->string('phone');
        
            $table->string('status')->default('pending'); 
            // pending, sent, failed, delivered
        
            $table->text('provider_response')->nullable();
        
            $table->timestamps();
        
            $table->index(['sms_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms_recipients');
    }
};
