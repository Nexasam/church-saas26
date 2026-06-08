<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_church_attendances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('member_id')
                  ->nullable()           // MUST be nullable for SET NULL
                  ->constrained()
                  ->nullOnDelete();

            $table->foreignId('home_church_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->date('date');

            $table->timestamps();

            $table->unique(['member_id', 'home_church_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_church_attendances');
    }
};
