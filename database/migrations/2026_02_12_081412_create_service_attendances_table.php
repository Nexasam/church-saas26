<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_attendances', function (Blueprint $table) {
            $table->id();

            // The member who attended
            $table->foreignId('member_id')
                ->constrained()
                ->cascadeOnDelete();

            // The church where the service occurred
            $table->foreignId('church_id')
                ->constrained()
                ->cascadeOnDelete();

            // Date of the service
            $table->date('service_date');

            // Optional: service name (e.g., "Sunday Service", "Youth Service")
            $table->string('service_name');

            $table->timestamps();

            // Ensure a member can only have **one attendance per service per church per date**
            $table->unique(['member_id', 'church_id', 'service_date', 'service_name'], 'unique_service_attendance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_attendances');
    }
};
