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
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
        
            // $table->index('entity_type'); 
            // // 'member', 'offering', 'event', etc.

            $table->string('entity_type')->index();

            $table->string('name');
            $table->string('slug');
        
            $table->enum('type', [
                'text',
                'select',
                'boolean',
                'date'
            ]);
     
            $table->json('options')->nullable();
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
