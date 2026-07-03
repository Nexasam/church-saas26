<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Income;
use App\Models\ServiceIncome;
use Inertia\Inertia;

class FinancePortalController extends Controller
{
    public function index()
    {
        $churchId   = auth()->user()->church_id;
        $now        = now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd   = $now->copy()->endOfMonth();

        // ── Summary stats (current month) ────────────────────────────────
        $totalIncome   = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->sum('amount');
        $totalExpenses = Expense::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount');
        $cashIncome    = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->where('source', 'cash')->sum('amount');
        $bankIncome    = Income::withoutGlobalScopes()->where('church_id', $churchId)->whereBetween('income_date', [$monthStart, $monthEnd])->where('source', '!=', 'cash')->sum('amount');

        // ── Recent transactions (last 10, incomes + expenses combined) ────
        $incomes  = Income::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with('attachments')
            ->with('category')
            ->orderByDesc('income_date')
            ->limit(20)
            ->get();

        $expenses = Expense::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with('attachments')
            ->with('category')
            ->orderByDesc('expense_date')
            ->limit(20)
            ->get();

        $allowedMethods = ['cash', 'transfer', 'pos', 'cheque', 'bank', 'offering', 'online'];

        $recentTransactions = $incomes->map(fn($i) => [
            'id'          => 'inc-' . $i->id,
            'date'        => $i->income_date->toDateString(),
            'description' => $i->note ?? $i->category?->name ?? 'Income',
            'category'    => $i->category?->name ?? '—',
            'type'        => 'income',
            'amount'      => (float) $i->amount,
            'method'      => in_array($i->source, $allowedMethods) ? $i->source : 'cash',
            'status'      => 'confirmed',
            'attachments' => $i->attachments->map(fn($a) => [
                'id'            => $a->id,
                'filename'      => $a->filename,
                'original_name' => $a->original_name,
                'mime_type'     => $a->mime_type,
                'size'          => $a->size,
                'url'           => \Illuminate\Support\Facades\Storage::url($a->path),
                'note'          => $a->note,
                'uploaded_by_name' => $a->uploadedBy?->name,
            ])->values()->all(),
        ])->concat($expenses->map(fn($e) => [
            'id'          => 'exp-' . $e->id,
            'date'        => $e->expense_date->toDateString(),
            'description' => $e->note ?? $e->category?->name ?? 'Expense',
            'category'    => $e->category?->name ?? '—',
            'type'        => 'expense',
            'amount'      => (float) $e->amount,
            'method'      => 'cash',
            'status'      => 'confirmed',
            'attachments' => $e->attachments->map(fn($a) => [
                'id'            => $a->id,
                'filename'      => $a->filename,
                'original_name' => $a->original_name,
                'mime_type'     => $a->mime_type,
                'size'          => $a->size,
                'url'           => \Illuminate\Support\Facades\Storage::url($a->path),
                'note'          => $a->note,
                'uploaded_by_name' => $a->uploadedBy?->name,
            ])->values()->all(),
        ]))->sortByDesc('date')->take(10)->values();

        // ── Pending reconciliations ───────────────────────────────────────
        $pendingReconciliations = ServiceIncome::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('reconciliation_status', ['pending', 'variance', 'investigating'])
            ->orderByDesc('service_date')
            ->get()
            ->map(fn($s) => [
                'id'                    => $s->id,
                'service_name'          => $s->service_name,
                'service_date'          => $s->service_date->toDateString(),
                'recorded_amount'       => (float) $s->recorded_amount,
                'banked_amount'         => $s->banked_amount ? (float) $s->banked_amount : null,
                'reconciliation_status' => $s->reconciliation_status ?? 'pending',
                'variance'              => $s->variance ? (float) $s->variance : null,
            ]);

        return Inertia::render('finance-portal/index', [
            'summary' => [
                'totalIncome'   => (float) $totalIncome,
                'totalExpenses' => (float) $totalExpenses,
                'netBalance'    => (float) ($totalIncome - $totalExpenses),
                'cashAmount'    => (float) $cashIncome,
                'bankAmount'    => (float) $bankIncome,
            ],
            'recentTransactions'     => $recentTransactions,
            'pendingReconciliations' => $pendingReconciliations,
            'user' => [
                'name'  => auth()->user()->name,
                'email' => auth()->user()->email,
            ],
        ]);
    }
}
