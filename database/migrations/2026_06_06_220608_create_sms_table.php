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
        Schema::create('sms', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
        
            $table->string('category')->nullable(); 
            // birthday, anniversary, notification, etc.
        
            $table->text('message');
        
            $table->string('status')->default('pending'); 
            // pending, processing, completed
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms');
    }
};
