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
        Schema::create('service_incomes', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('church_id')->constrained()->cascadeOnDelete();
        
            $table->string('service_name');
            // e.g. "First Service", "Second Service", "5 Hours with God", "Sunday Evening"
            
            $table->date('service_date');
        
            // COUNTED DURING SERVICE
            $table->decimal('recorded_amount', 12, 2)->default(0);
        
            // AMOUNT DEPOSITED TO BANK
            $table->decimal('banked_amount', 12, 2)->nullable();
        
            $table->date('banked_date')->nullable();
        
            // RECONCILIATION STATUS (VERY IMPORTANT)
            $table->string('reconciliation_status')->default('pending');
            // pending, matched, mismatch, reviewed
        
            // DIFFERENCE BETWEEN BOTH
            $table->decimal('variance', 12, 2)->default(0);
        
            // WHO DID RECONCILIATION
            $table->foreignId('reconciled_by')->nullable()->constrained('users');
        
            $table->timestamp('reconciled_at')->nullable();
        
            // NOTES FOR DISCREPANCIES
            $table->text('reconciliation_note')->nullable();
        
            $table->timestamps();
        
            $table->index(['church_id', 'service_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_incomes');
    }
};
