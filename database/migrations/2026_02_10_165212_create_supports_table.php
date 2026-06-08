<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('church_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('amount', 12, 2);

            $table->string('reference')->nullable();
            $table->string('channel')->nullable(); // paystack, transfer, cash, etc

            $table->string('status')->default('pending'); 
            // pending | successful | failed

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supports');
    }
};
