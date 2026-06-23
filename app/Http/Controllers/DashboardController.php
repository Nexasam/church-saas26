<?php

namespace App\Http\Controllers;

use App\Models\CareCase;
use App\Models\Member;
use App\Models\ProspectiveMember;
use App\Models\ServiceAttendance;
use App\Models\Income;
use App\Models\Expense;
use App\Models\FollowUp;
use App\Models\SmsCampaign;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Redirect workers to their dashboard
        if (!$user->is_super_admin && ($user->role && $user->role->slug === 'member')) {
            return redirect()->route('worker.dashboard');
        }

        $churchId = $user->church_id;
        $now      = now();
        $monthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd   = $now->copy()->subMonth()->endOfMonth();

        // ── Members ────────────────────────────────────────────────────────
        $totalMembers  = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))->count();
        $activeMembers = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true))->count();
        $lastMonthMembers = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $thisMonthNewMembers = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->where('created_at', '>=', $monthStart)->count();
        $memberTrend = $lastMonthMembers > 0
            ? round((($thisMonthNewMembers - $lastMonthMembers) / $lastMonthMembers) * 100, 1)
            : 0;

        // ── Evangelism ────────────────────────────────────────────────────
        $soulsWonThisMonth = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('created_at', '>=', $monthStart)
            ->count();
        $soulsWonLastMonth = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
        $soulsTrend = $soulsWonLastMonth > 0
            ? round((($soulsWonThisMonth - $soulsWonLastMonth) / $soulsWonLastMonth) * 100, 1)
            : 0;

        // Evangelism funnel (current month)
        $stages = ['soul_won', 'visited', 'membership_class', 'worker', 'established'];
        $funnelCounts = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');
        $funnelTotal = max($funnelCounts->sum(), 1);
        $funnelData = collect($stages)->map(fn($s) => [
            'stage' => $s,
            'label' => match($s) {
                'soul_won' => 'Members Reached', 'visited' => 'Visited',
                'membership_class' => 'Membership Class', 'worker' => 'Worker', 'established' => 'Established',
            },
            'count' => (int)($funnelCounts[$s] ?? 0),
            'pct'   => round((($funnelCounts[$s] ?? 0) / $funnelTotal) * 100),
            'color' => match($s) {
                'soul_won' => 'oklch(0.55 0.18 162)', 'visited' => 'oklch(0.55 0.18 230)',
                'membership_class' => 'oklch(0.65 0.16 84)', 'worker' => 'oklch(0.55 0.18 295)',
                'established' => 'oklch(0.52 0.15 162)',
            },
        ])->values();

        // ── Attendance ────────────────────────────────────────────────────
        // service_attendances is per-member, so count rows per service date
        $lastServiceDate = ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('status', 'present')
            ->orderByDesc('service_date')
            ->value('service_date');

        $lastAttendance = $lastServiceDate
            ? ServiceAttendance::withoutGlobalScopes()
                ->where('church_id', $churchId)
                ->where('service_date', $lastServiceDate)
                ->where('status', 'present')
                ->count()
            : 0;

        $prevServiceDate = ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('status', 'present')
            ->where('service_date', '<', $lastServiceDate ?? now())
            ->orderByDesc('service_date')
            ->value('service_date');

        $prevAttendance = $prevServiceDate
            ? ServiceAttendance::withoutGlobalScopes()
                ->where('church_id', $churchId)
                ->where('service_date', $prevServiceDate)
                ->where('status', 'present')
                ->count()
            : 0;

        $attendanceTrend = $prevAttendance > 0
            ? round((($lastAttendance - $prevAttendance) / $prevAttendance) * 100, 1)
            : 0;

        // 12 most recent service attendance counts for sparkline
        $attendanceSparkline = ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('status', 'present')
            ->selectRaw('service_date, COUNT(*) as cnt')
            ->groupBy('service_date')
            ->orderByDesc('service_date')
            ->limit(12)
            ->pluck('cnt')
            ->reverse()
            ->values()
            ->toArray();

        // ── Finance ───────────────────────────────────────────────────────
        $monthlyIncome = Income::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('income_date', '>=', $monthStart)
            ->sum('amount');
        $lastMonthIncome = Income::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereBetween('income_date', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');
        $incomeTrend = $lastMonthIncome > 0
            ? round((($monthlyIncome - $lastMonthIncome) / $lastMonthIncome) * 100, 1)
            : 0;

        $monthlyExpenses = Expense::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->where('expense_date', '>=', $monthStart)
            ->sum('amount');

        // 6-month trend
        $financeMonthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = $now->copy()->subMonths($i);
            $financeMonthly[] = [
                'month'    => $d->format('M'),
                'income'   => (float) Income::withoutGlobalScopes()->where('church_id', $churchId)->whereYear('income_date', $d->year)->whereMonth('income_date', $d->month)->sum('amount'),
                'expenses' => (float) Expense::withoutGlobalScopes()->where('church_id', $churchId)->whereYear('expense_date', $d->year)->whereMonth('expense_date', $d->month)->sum('amount'),
            ];
        }

        // ── Follow-ups ────────────────────────────────────────────────────
        $pendingFollowUps = FollowUp::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereNotIn('stage', ['established'])
            ->count();
        $urgentFollowUps = FollowUp::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('priority', ['urgent', 'high'])
            ->whereNotIn('stage', ['established'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->limit(5)
            ->get()
            ->map(fn($f) => [
                'id'          => $f->id,
                'name'        => $f->name,
                'initials'    => collect(explode(' ', $f->name))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join(''),
                'phone'       => $f->phone,
                'stage'       => $f->stage,
                'priority'    => $f->priority,
                'next_action' => $f->next_action ?? 'Follow up required',
                'assigned_to' => $f->assignedTo?->name ?? '—',
                'last_contact'=> $f->last_contact_at ? $f->last_contact_at->diffForHumans() : 'Not contacted',
                'days_in_stage' => $f->days_in_stage,
            ]);

        // ── Care Cases ────────────────────────────────────────────────────
        $openCareCases = CareCase::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('status', ['open', 'in_progress', 'escalated'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'id'       => $c->id,
                'name'     => $c->member_name,
                'type'     => $c->type,
                'priority' => $c->priority,
                'status'   => $c->status,
            ]);
        $openCareCasesCount   = CareCase::withoutGlobalScopes()->where('church_id', $churchId)->whereIn('status', ['open', 'in_progress', 'escalated'])->count();
        $urgentCareCasesCount = CareCase::withoutGlobalScopes()->where('church_id', $churchId)->where('priority', 'urgent')->whereIn('status', ['open', 'in_progress'])->count();

        // ── Recent Activity ────────────────────────────────────────────────
        $recentMembers = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'first_name', 'last_name', 'created_at'])
            ->map(fn($m) => [
                'id'   => $m->id,
                'type' => 'member_joined',
                'title'       => $m->first_name . ' ' . $m->last_name . ' joined',
                'description' => 'New member added to the church',
                'actor'       => 'System',
                'timestamp'   => $m->created_at->toIso8601String(),
            ]);
        $recentSouls = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'name', 'created_at'])
            ->map(fn($p) => [
                'id'          => 'soul-' . $p->id,
                'type'        => 'soul_won',
                'title'       => $p->name . ' logged as Members Reached',
                'description' => 'New evangelism record created',
                'actor'       => 'Evangelism Team',
                'timestamp'   => $p->created_at->toIso8601String(),
            ]);
        $activityFeed = $recentMembers->concat($recentSouls)
            ->sortByDesc('timestamp')
            ->values()
            ->take(8);

        // ── Conversion rate ────────────────────────────────────────────────
        $totalProspects   = max(ProspectiveMember::withoutGlobalScopes()->where('church_id', $churchId)->count(), 1);
        $establishedCount = ProspectiveMember::withoutGlobalScopes()->where('church_id', $churchId)->where('stage', 'established')->count();
        $conversionRate   = round(($establishedCount / $totalProspects) * 100, 1);

        return Inertia::render('dashboard', [
            'stats' => [
                'soulsWon'       => ['value' => $soulsWonThisMonth,   'trend' => $soulsTrend],
                'activeMembers'  => ['value' => $activeMembers,       'trend' => $memberTrend],
                'pendingFollowUps' => ['value' => $pendingFollowUps,  'urgent' => $urgentFollowUps->count()],
                'monthlyIncome'  => ['value' => (float)$monthlyIncome, 'trend' => $incomeTrend],
                'monthlyExpenses'=> ['value' => (float)$monthlyExpenses],
                'conversionRate' => ['value' => $conversionRate],
                'attendance'     => ['value' => $lastAttendance, 'trend' => $attendanceTrend, 'sparkline' => $attendanceSparkline],
            ],
            'funnelData'       => $funnelData,
            'financeMonthly'   => $financeMonthly,
            'urgentFollowUps'  => $urgentFollowUps,
            'openCareCases'    => $openCareCases,
            'openCareCasesCount'   => $openCareCasesCount,
            'urgentCareCasesCount' => $urgentCareCasesCount,
            'activityFeed'     => $activityFeed,
            'churchName'       => auth()->user()->church?->name ?? 'Your Church',
        ]);
    }
}


