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
        Schema::create('church_member', function (Blueprint $table) {
            $table->id();

            $table->foreignId('church_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->foreignId('member_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->enum('membership_type', [
                'full',
                'visitor',
                'youth',
                'child'
            ])->default('full');

            $table->boolean('is_active')->default(true);

            $table->date('joined_at')->nullable();

            $table->timestamps();

            $table->unique(['church_id', 'member_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('church_member');
    }
};
