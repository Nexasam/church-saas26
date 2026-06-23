<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('celebration_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('icon')->default('PartyPopper');
            $table->string('color')->default('bg-amber-100 text-amber-700');
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        Schema::create('celebrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('member_name');
            $table->foreignId('category_id')->constrained('celebration_categories')->cascadeOnDelete();
            $table->date('date');
            $table->text('note')->nullable();
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();

            $table->index(['church_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('celebrations');
        Schema::dropIfExists('celebration_categories');
    }
};
