<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->string('name');                  // e.g. "Finance Officer", "Pastor"
            $table->string('slug');                  // e.g. "finance_officer"
            $table->boolean('is_system')->default(false); // system roles can't be deleted
            // Permissions stored as JSON: { "members": ["view","create"], "finance": ["view"] }
            $table->json('permissions')->nullable();
            $table->timestamps();

            $table->unique(['church_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
