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
        Schema::create('income_categories', function (Blueprint $table) {
            $table->id();
        
            // null = system-wide category
            // not null = church-specific override/extension
            $table->foreignId('church_id')->nullable()->constrained()->cascadeOnDelete();
        
            $table->string('name');
            $table->string('slug');
        
            $table->enum('type', ['system', 'custom'])->default('system');
        
            $table->boolean('is_active')->default(true);
        
            $table->timestamps();
        
            $table->unique(['church_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_categories');
    }
};
