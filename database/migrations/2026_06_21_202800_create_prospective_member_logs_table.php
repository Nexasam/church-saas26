<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospective_member_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospective_member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('logged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['call', 'message'])->default('call');
            $table->string('channel')->nullable(); // WhatsApp, SMS, Email (for messages)
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['prospective_member_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospective_member_logs');
    }
};
