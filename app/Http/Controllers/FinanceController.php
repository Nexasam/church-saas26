<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Income;
use App\Models\IncomeCategory;
use App\Models\ServiceIncome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $churchId = auth()->user()->church_id;
        $now      = now();
        $month    = (int) $request->query('month', $now->month);
        $year     = (int) $request->query('year',  $now->year);

        // ── Summary stats ──────────────────────────────────────────────────
        $monthStart = now()->setYear($year)->setMonth($month)->startOfMonth();
        $monthEnd   = $monthStart->copy()->endOfMonth();

        $totalIncome   = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->sum('amount');
        $totalExpenses = Expense::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount');
        $cashIncome    = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->where('source', 'cash')->sum('amount');
        $bankIncome    = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->where('source', '!=', 'cash')->sum('amount');

        // ── 6-month trend ──────────────────────────────────────────────────
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = $now->copy()->subMonths($i);
            $monthlyTrend[] = [
                'month'    => $d->format('M'),
                'income'   => (float) Income::withoutGlobalScopes()->where('church_id', $churchId)->whereYear('income_date', $d->year)->whereMonth('income_date', $d->month)->sum('amount'),
                'expenses' => (float) Expense::withoutGlobalScopes()->where('church_id', $churchId)->whereYear('expense_date', $d->year)->whereMonth('expense_date', $d->month)->sum('amount'),
            ];
        }

        // ── Transactions ───────────────────────────────────────────────────
        $search     = $request->query('search', '');
        $typeFilter = $request->query('type', 'all'); // all | income | expense

        $incomeQuery = Income::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with('category')
            ->when($search, fn($q) => $q->where(fn($q2) => $q2->where('note', 'like', "%{$search}%")->orWhereHas('category', fn($q3) => $q3->where('name', 'like', "%{$search}%"))))
            ->orderByDesc('income_date');

        $expenseQuery = Expense::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with('category')
            ->when($search, fn($q) => $q->where(fn($q2) => $q2->where('note', 'like', "%{$search}%")->orWhereHas('category', fn($q3) => $q3->where('name', 'like', "%{$search}%"))))
            ->orderByDesc('expense_date');

        $incomes  = $typeFilter !== 'expense' ? $incomeQuery->limit(100)->get() : collect();
        $expenses = $typeFilter !== 'income'  ? $expenseQuery->limit(100)->get() : collect();

        $transactions = $incomes->map(fn($i) => [
            'id'          => 'inc-' . $i->id,
            'date'        => $i->income_date->toDateString(),
            'description' => $i->note ?? $i->category?->name ?? 'Income',
            'category'    => $i->category?->name ?? '—',
            'type'        => 'income',
            'amount'      => (float) $i->amount,
            'method'      => $i->source ?? 'cash',
            'status'      => 'confirmed',
            'recorded_by' => '—',
        ])->concat($expenses->map(fn($e) => [
            'id'          => 'exp-' . $e->id,
            'date'        => $e->expense_date->toDateString(),
            'description' => $e->note ?? $e->category?->name ?? 'Expense',
            'category'    => $e->category?->name ?? '—',
            'type'        => 'expense',
            'amount'      => (float) $e->amount,
            'method'      => 'cash',
            'status'      => 'confirmed',
            'recorded_by' => '—',
        ]))->sortByDesc('date')->values();

        // ── Service Offerings ──────────────────────────────────────────────
        $serviceOfferings = ServiceIncome::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderByDesc('service_date')
            ->limit(20)
            ->get()
            ->map(fn($s) => [
                'id'                    => $s->id,
                'service_name'          => $s->service_name,
                'service_date'          => $s->service_date->toDateString(),
                'recorded_amount'       => (float) $s->recorded_amount,
                'banked_amount'         => $s->banked_amount ? (float)$s->banked_amount : null,
                'banked_date'           => $s->banked_date?->toDateString(),
                'reconciliation_status' => $s->reconciliation_status ?? 'pending',
                'variance'              => $s->variance ? (float)$s->variance : null,
                'reconciliation_note'   => $s->reconciliation_note,
            ]);

        // ── Income + expense categories ────────────────────────────────────
        $incomeCategories  = IncomeCategory::withoutGlobalScopes()->where('church_id', $churchId)->where('is_active', true)->get(['id', 'name']);
        $expenseCategories = ExpenseCategory::withoutGlobalScopes()->where('church_id', $churchId)->where('is_active', true)->get(['id', 'name']);

        return Inertia::render('finance', [
            'summary' => [
                'totalIncome'   => (float) $totalIncome,
                'totalExpenses' => (float) $totalExpenses,
                'netBalance'    => (float) ($totalIncome - $totalExpenses),
                'cashAmount'    => (float) $cashIncome,
                'bankAmount'    => (float) $bankIncome,
                'lastUpdated'   => now()->toIso8601String(),
                'monthlyTrend'  => $monthlyTrend,
            ],
            'transactions'      => $transactions,
            'serviceOfferings'  => $serviceOfferings,
            'incomeCategories'  => $incomeCategories,
            'expenseCategories' => $expenseCategories,
            'filters'           => ['month' => $month, 'year' => $year, 'search' => $search, 'type' => $typeFilter],
        ]);
    }

    /** Record a general income transaction */
    public function storeIncome(Request $request)
    {
        $validated = $request->validate([
            'income_category_id' => ['required', 'integer', 'exists:income_categories,id'],
            'amount'             => ['required', 'numeric', 'min:0.01'],
            'source'             => ['required', 'string', 'max:50'],
            'income_date'        => ['required', 'date'],
            'note'               => ['nullable', 'string', 'max:500'],
        ]);

        Income::create($validated);

        return back()->with('success', 'Income recorded.');
    }

    /** Record an expense */
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'expense_category_id' => ['required', 'integer', 'exists:expense_categories,id'],
            'amount'              => ['required', 'numeric', 'min:0.01'],
            'paid_to'             => ['nullable', 'string', 'max:200'],
            'expense_date'        => ['required', 'date'],
            'note'                => ['nullable', 'string', 'max:500'],
        ]);

        Expense::create($validated);

        return back()->with('success', 'Expense recorded.');
    }

    /** Record a full service offering */
    public function storeServiceOffering(Request $request)
    {
        $validated = $request->validate([
            'service_name'    => ['required', 'string', 'max:200'],
            'service_date'    => ['required', 'date'],
            'recorded_amount' => ['required', 'numeric', 'min:0'],
            'sections'        => ['nullable', 'array'],   // breakdown by category/method
        ]);

        $serviceIncome = ServiceIncome::create([
            'service_name'           => $validated['service_name'],
            'service_date'           => $validated['service_date'],
            'recorded_amount'        => $validated['recorded_amount'],
            'reconciliation_status'  => 'pending',
        ]);

        // Also create Income records per section if provided
        if (! empty($validated['sections'])) {
            $cat = IncomeCategory::withoutGlobalScopes()
                ->where('church_id', auth()->user()->church_id)
                ->where('slug', 'offering')
                ->first();

            foreach ($validated['sections'] as $section) {
                $total = array_sum(array_values($section['amounts'] ?? []));
                if ($total > 0) {
                    Income::create([
                        'income_category_id' => $cat?->id ?? null,
                        'amount'             => $total,
                        'source'             => 'offering',
                        'income_date'        => $validated['service_date'],
                        'note'               => $section['label'] ?? $validated['service_name'],
                    ]);
                }
            }
        }

        return back()->with('success', 'Service offering recorded.');
    }

    /** Mark a service offering as banked / reconcile */
    public function reconcileOffering(Request $request, ServiceIncome $serviceIncome)
    {
        $validated = $request->validate([
            'banked_amount'        => ['required', 'numeric', 'min:0'],
            'banked_date'          => ['required', 'date'],
            'reconciliation_note'  => ['nullable', 'string', 'max:500'],
        ]);

        $variance = $validated['banked_amount'] - $serviceIncome->recorded_amount;
        $status   = abs($variance) < 0.01 ? 'matched' : (abs($variance) > 5000 ? 'investigating' : 'variance');

        $serviceIncome->update([
            'banked_amount'          => $validated['banked_amount'],
            'banked_date'            => $validated['banked_date'],
            'reconciliation_status'  => $status,
            'variance'               => $variance,
            'reconciliation_note'    => $validated['reconciliation_note'] ?? null,
            'reconciled_by'          => auth()->user()->name,
            'reconciled_at'          => now(),
        ]);

        return back()->with('success', 'Offering reconciled.');
    }

    /** Delete a transaction */
    public function destroyIncome(Income $income)
    {
        $income->delete();
        return back()->with('success', 'Income record deleted.');
    }

    public function destroyExpense(Expense $expense)
    {
        $expense->delete();
        return back()->with('success', 'Expense record deleted.');
    }

    /** Export transactions as CSV */
    public function export(Request $request)
    {
        $churchId = auth()->user()->church_id;
        $month    = (int) $request->query('month', now()->month);
        $year     = (int) $request->query('year',  now()->year);
        $monthStart = now()->setYear($year)->setMonth($month)->startOfMonth();
        $monthEnd   = $monthStart->copy()->endOfMonth();

        $incomes  = Income::withoutGlobalScopes()->where('church_id', $churchId)->with('category')->whereBetween('income_date', [$monthStart, $monthEnd])->get();
        $expenses = Expense::withoutGlobalScopes()->where('church_id', $churchId)->with('category')->whereBetween('expense_date', [$monthStart, $monthEnd])->get();

        $rows   = ["Date,Description,Category,Type,Amount,Method,Status\r\n"];
        foreach ($incomes as $i) {
            $rows[] = implode(',', [$i->income_date, $i->note ?? '', $i->category?->name ?? '', 'Income', $i->amount, $i->source ?? '', 'confirmed']) . "\r\n";
        }
        foreach ($expenses as $e) {
            $rows[] = implode(',', [$e->expense_date, $e->note ?? '', $e->category?->name ?? '', 'Expense', $e->amount, 'cash', 'confirmed']) . "\r\n";
        }

        return response(implode('', $rows), 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=finance-{$year}-{$month}.csv",
        ]);
    }
}
