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
        Schema::create('home_church_member', function (Blueprint $table) {
            $table->id();

            $table->foreignId('church_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('home_church_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('member_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('role')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('joined_at')->nullable();
            
            $table->timestamps();

            // Unique constraint: a member cannot belong to the same home church in the same church more than once
            $table->unique(['church_id', 'home_church_id', 'member_id'], 'unique_home_church_member');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_church_member');
    }
};
