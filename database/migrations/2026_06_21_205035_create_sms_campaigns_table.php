<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sent_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('recipient_group')->default('active'); // all, active, followup, etc.
            $table->string('type')->default('bulk'); // bulk | individual
            $table->string('recipient_name')->nullable(); // for individual sends
            $table->string('recipient_phone')->nullable();
            $table->integer('recipients_count')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->integer('sms_units_used')->default(0);
            $table->enum('status', ['pending', 'sent', 'failed', 'scheduled'])->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['church_id', 'status']);
        });

        // Monthly usage tracker
        Schema::create('sms_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->integer('units_used')->default(0);
            $table->timestamps();

            $table->unique(['church_id', 'year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_usage');
        Schema::dropIfExists('sms_campaigns');
    }
};
