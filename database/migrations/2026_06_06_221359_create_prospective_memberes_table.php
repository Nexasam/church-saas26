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
        Schema::create('prospective_members', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
        
            $table->string('name');
            $table->string('phone');
        
            $table->string('email')->nullable();
        
            $table->string('source');
            // invited, evangelism, attended_service_by_self, outreach, social_media
        
            $table->foreignId('brought_by')
                ->nullable()
                ->constrained('members')
                ->nullOnDelete();
        
            $table->foreignId('followed_up_by')
                ->nullable()
                ->constrained('members')
                ->nullOnDelete();
        
            $table->string('status')->default('new');
            // new, contacted, visited, converted, inactive
        
            $table->date('first_contacted_at')->nullable();
        
            $table->timestamps();
        
            $table->index(['church_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prospective_members');
    }
};
