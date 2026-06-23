<?php

namespace App\Http\Controllers;

use App\Models\Church;
use App\Models\Income;
use App\Models\Expense;
use App\Models\Member;
use App\Models\SmsCampaign;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index()
    {
        $churchId = auth()->user()->church_id;
        $church = Church::find($churchId);
        
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        // Get current plan details
        $plan = $church->payment_category ?? 'free';
        $plans = [
            'starter' => ['name' => 'Starter', 'price' => 15000, 'sms_limit' => 300, 'member_limit' => 200, 'admin_limit' => 1],
            'growth' => ['name' => 'Growth', 'price' => 35000, 'sms_limit' => 500, 'member_limit' => 1000, 'admin_limit' => 5],
            'enterprise' => ['name' => 'Enterprise', 'price' => 85000, 'sms_limit' => 1000, 'member_limit' => 0, 'admin_limit' => 0],
            'free' => ['name' => 'Free Trial', 'price' => 0, 'sms_limit' => 50, 'member_limit' => 50, 'admin_limit' => 1],
        ];

        $currentPlan = $plans[$plan] ?? $plans['free'];

        // Usage metrics
        $memberCount = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))->count();
        $activeMembers = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true))->count();
        
        $smsUsedThisMonth = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('sms_units_used');

        // Financial summary
        $monthlyIncome = Income::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereBetween('income_date', [$monthStart, $monthEnd])
            ->sum('amount');

        $monthlyExpenses = Expense::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereBetween('expense_date', [$monthStart, $monthEnd])
            ->sum('amount');

        // Invoice history (simulated - in production this would come from payment gateway)
        $invoices = [
            [
                'id' => 'INV-001',
                'date' => $now->copy()->subMonth()->format('Y-m-d'),
                'amount' => $currentPlan['price'],
                'status' => 'paid',
                'plan' => $currentPlan['name'],
            ],
        ];

        // Usage percentages
        $memberUsage = $currentPlan['member_limit'] > 0 
            ? round(($memberCount / $currentPlan['member_limit']) * 100, 1) 
            : 0;
        
        $smsUsage = $currentPlan['sms_limit'] > 0 
            ? round(($smsUsedThisMonth / $currentPlan['sms_limit']) * 100, 1) 
            : 0;

        return Inertia::render('billing', [
            'church' => [
                'id' => $church->id,
                'name' => $church->name,
                'plan' => $plan,
                'subscription_expiry' => $church->subscription_expiry?->toDateString(),
                'onboarding_complete' => (bool) $church->onboarding_complete,
            ],
            'currentPlan' => $currentPlan,
            'availablePlans' => array_filter($plans, fn($p) => $p['name'] !== 'Free Trial'),
            'usage' => [
                'members' => [
                    'current' => $memberCount,
                    'active' => $activeMembers,
                    'limit' => $currentPlan['member_limit'],
                    'percentage' => $memberUsage,
                    'near_limit' => $memberUsage >= 80,
                ],
                'sms' => [
                    'current' => $smsUsedThisMonth,
                    'limit' => $currentPlan['sms_limit'],
                    'percentage' => $smsUsage,
                    'near_limit' => $smsUsage >= 80,
                ],
            ],
            'financials' => [
                'monthly_income' => (float) $monthlyIncome,
                'monthly_expenses' => (float) $monthlyExpenses,
                'net_balance' => (float) ($monthlyIncome - $monthlyExpenses),
            ],
            'invoices' => $invoices,
            'nextBillingDate' => $church->subscription_expiry?->addDay()->toDateString(),
        ]);
    }

    /**
     * Upgrade/downgrade plan (simulated - integrate with payment gateway in production)
     */
    public function updatePlan(Request $request)
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:starter,growth,enterprise'],
        ]);

        $church = Church::find(auth()->user()->church_id);
        
        // In production, this would:
        // 1. Create payment intent with Stripe/Paystack
        // 2. Redirect to payment page
        // 3. On success, update plan and subscription_expiry
        
        $church->update([
            'payment_category' => 'paid',
            'subscription_expiry' => now()->addMonth(),
        ]);

        return back()->with('success', 'Plan updated successfully.');
    }

    /**
     * Get invoice details (simulated)
     */
    public function invoice(Request $request, string $invoiceId)
    {
        // In production, fetch from payment gateway (Stripe, Paystack, etc.)
        return back()->with('info', 'Invoice download would be available here.');
    }
}
