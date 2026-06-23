<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Income;
use App\Models\IncomeCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->church = Church::factory()->create();
        $this->user = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);
    }

    public function test_authenticated_users_can_view_finance()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('finance.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_finance()
    {
        $response = $this->get(route('finance.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_income()
    {
        $this->actingAs($this->user);

        $category = IncomeCategory::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('finance.income.store'), [
            'income_category_id' => $category->id,
            'amount' => 5000.00,
            'source' => 'cash',
            'income_date' => now()->toDateString(),
            'note' => 'Test income',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('incomes', [
            'amount' => 5000.00,
            'source' => 'cash',
        ]);
    }

    public function test_can_create_expense()
    {
        $this->actingAs($this->user);

        $category = ExpenseCategory::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('finance.expense.store'), [
            'expense_category_id' => $category->id,
            'amount' => 2000.00,
            'paid_to' => 'Vendor',
            'expense_date' => now()->toDateString(),
            'note' => 'Test expense',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expenses', [
            'amount' => 2000.00,
            'paid_to' => 'Vendor',
        ]);
    }

    public function test_can_create_service_offering()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('finance.service.store'), [
            'service_name' => 'First Service',
            'service_date' => now()->toDateString(),
            'recorded_amount' => 10000.00,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('service_incomes', [
            'service_name' => 'First Service',
            'recorded_amount' => 10000.00,
        ]);
    }

    public function test_can_reconcile_offering()
    {
        $this->actingAs($this->user);

        $serviceIncome = \App\Models\ServiceIncome::factory()->create([
            'church_id' => $this->church->id,
            'recorded_amount' => 10000.00,
            'reconciliation_status' => 'pending',
        ]);

        $response = $this->patch(route('finance.service.reconcile', $serviceIncome), [
            'banked_amount' => 10000.00,
            'banked_date' => now()->toDateString(),
            'reconciliation_note' => 'Matched',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('service_incomes', [
            'id' => $serviceIncome->id,
            'reconciliation_status' => 'matched',
        ]);
    }

    public function test_can_delete_income()
    {
        $this->actingAs($this->user);

        $income = Income::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('finance.income.destroy', $income));
        $response->assertRedirect();

        $this->assertDatabaseMissing('incomes', ['id' => $income->id]);
    }

    public function test_can_delete_expense()
    {
        $this->actingAs($this->user);

        $expense = Expense::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('finance.expense.destroy', $expense));
        $response->assertRedirect();

        $this->assertDatabaseMissing('expenses', ['id' => $expense->id]);
    }

    public function test_can_export_finance()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('finance.export'));
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv');
    }
}
