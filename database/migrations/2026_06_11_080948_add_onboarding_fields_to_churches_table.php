<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('churches', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('address');
            $table->string('city')->nullable()->after('phone');
            $table->string('country')->default('Nigeria')->after('city');
            $table->enum('size', ['small', 'medium', 'large', 'mega'])->default('small')->after('country');
            $table->string('theme_color')->default('blue')->after('size'); // blue | purple | emerald
            $table->boolean('onboarding_complete')->default(false)->after('theme_color');
            $table->string('logo_url')->nullable()->after('onboarding_complete');
        });
    }

    public function down(): void
    {
        Schema::table('churches', function (Blueprint $table) {
            $table->dropColumn(['phone', 'city', 'country', 'size', 'theme_color', 'onboarding_complete', 'logo_url']);
        });
    }
};
