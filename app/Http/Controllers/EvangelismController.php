<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\ProspectiveMember;
use App\Models\ProspectiveMemberLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvangelismController extends Controller
{
    /**
     * Show the evangelism page.
     */
    public function index(Request $request)
    {
        $churchId = auth()->user()->church_id;
        $month    = (int) $request->query('month', now()->month); // 1–12
        $year     = (int) $request->query('year',  now()->year);
        $search   = $request->query('search', '');
        $stage    = $request->query('stage', '');

        // ── Funnel (filtered by month/year) ──────────────────────────────────
        $stages = ['soul_won', 'visited', 'membership_class', 'worker', 'established'];

        $counts = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');

        $funnelTotal = max($counts->sum(), 1);

        $funnelData = collect($stages)->map(fn ($s) => [
            'stage' => $s,
            'count' => (int) ($counts[$s] ?? 0),
            'pct'   => round((($counts[$s] ?? 0) / $funnelTotal) * 100),
        ])->values();

        // ── Source breakdown (all-time) ───────────────────────────────────────
        $sources = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source');

        // ── Records (server-side search + stage filter) ───────────────────────
        $query = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['broughtBy', 'followedUpBy', 'convertedMember'])
            ->orderByDesc('date_won')
            ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        if ($stage && in_array($stage, $stages)) {
            $query->where('stage', $stage);
        }

        $records = $query->paginate(50)->through(fn ($pm) => $this->formatRecord($pm));

        // ── Leaderboard ───────────────────────────────────────────────────────
        $leaderboard = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereNotNull('brought_by')
            ->selectRaw('brought_by, COUNT(*) as count')
            ->groupBy('brought_by')
            ->orderByDesc('count')
            ->limit(10)
            ->with('broughtBy')
            ->get()
            ->map(fn ($row) => [
                'member_id' => $row->brought_by,
                'name'      => trim(($row->broughtBy?->first_name ?? '') . ' ' . ($row->broughtBy?->last_name ?? '')),
                'initials'  => strtoupper(
                    substr($row->broughtBy?->first_name ?? 'U', 0, 1) .
                    substr($row->broughtBy?->last_name  ?? 'U', 0, 1)
                ),
                'count' => (int) $row->count,
            ]);

        // ── Members for dropdowns ─────────────────────────────────────────────
        $members = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($m) => ['id' => $m->id, 'name' => trim($m->first_name . ' ' . $m->last_name)]);

        // ── All-time stats ────────────────────────────────────────────────────
        $allCounts = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');

        return Inertia::render('evangelism', [
            'funnelData'      => $funnelData,
            'sourceBreakdown' => $sources,
            'records'         => $records,
            'leaderboard'     => $leaderboard,
            'members'         => $members,
            'stats'           => [
                'total'       => (int) $allCounts->sum(),
                'established' => (int) ($allCounts['established'] ?? 0),
                'converted'   => ProspectiveMember::withoutGlobalScopes()
                    ->where('church_id', $churchId)
                    ->whereNotNull('converted_at')
                    ->count(),
            ],
            'filters' => [
                'month'  => $month,
                'year'   => $year,
                'search' => $search,
                'stage'  => $stage,
            ],
        ]);
    }

    /**
     * Log a new soul won.
     */
    public function store(Request $request)
    {
        $request->merge([
            'brought_by'     => $request->input('brought_by') ?: null,
            'followed_up_by' => $request->input('followed_up_by') ?: null,
        ]);

        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'location'       => ['nullable', 'string', 'max:200'],
            'source'         => ['required', 'string', 'max:50'],
            'date_won'       => ['required', 'date'],
            'brought_by'     => ['nullable', 'integer', 'exists:members,id'],
            'followed_up_by' => ['nullable', 'integer', 'exists:members,id'],
            'notes'          => ['nullable', 'string', 'max:2000'],
        ]);

        ProspectiveMember::create([
            ...$validated,
            'phone'  => $validated['phone'] ?? '',
            'stage'  => 'soul_won',
            'status' => 'new',
        ]);

        return back()->with('success', "{$validated['name']} logged successfully.");
    }

    /**
     * Update stage, status, notes, or any editable field.
     */
    public function update(Request $request, ProspectiveMember $prospectiveMember)
    {
        $request->merge([
            'brought_by'     => $request->input('brought_by') ?: null,
            'followed_up_by' => $request->input('followed_up_by') ?: null,
        ]);

        $validated = $request->validate([
            'stage'          => ['sometimes', 'in:soul_won,visited,membership_class,worker,established'],
            'status'         => ['sometimes', 'in:new,contacted,visited,converted,inactive'],
            'name'           => ['sometimes', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            'location'       => ['nullable', 'string', 'max:200'],
            'brought_by'     => ['nullable', 'integer', 'exists:members,id'],
            'followed_up_by' => ['nullable', 'integer', 'exists:members,id'],
            'notes'          => ['nullable', 'string', 'max:2000'],
        ]);

        $prospectiveMember->update($validated);

        return back()->with('success', 'Record updated.');
    }

    /**
     * Get logs for a single prospective member (JSON).
     */
    public function logs(ProspectiveMember $prospectiveMember)
    {
        $logs = $prospectiveMember->logs()
            ->with('loggedBy:id,name')
            ->get()
            ->map(fn ($l) => [
                'id'         => $l->id,
                'type'       => $l->type,
                'channel'    => $l->channel,
                'note'       => $l->note,
                'logged_by'  => $l->loggedBy?->name ?? 'You',
                'created_at' => $l->created_at->diffForHumans(),
            ]);

        return response()->json($logs);
    }

    /**
     * Store a call/message log.
     */
    public function storeLog(Request $request, ProspectiveMember $prospectiveMember)
    {
        $validated = $request->validate([
            'type'    => ['required', 'in:call,message'],
            'channel' => ['nullable', 'string', 'max:50'],
            'note'    => ['nullable', 'string', 'max:2000'],
        ]);

        $prospectiveMember->logs()->create([
            ...$validated,
            'logged_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Log saved.']);
    }

    /**
     * Delete a log entry.
     */
    public function destroyLog(ProspectiveMember $prospectiveMember, ProspectiveMemberLog $log)
    {
        abort_unless($log->prospective_member_id === $prospectiveMember->id, 404);
        $log->delete();
        return response()->json(['message' => 'Log deleted.']);
    }

    /**
     * Convert a prospective member to a full member.
     */
    public function convert(Request $request, ProspectiveMember $prospectiveMember)
    {
        if ($prospectiveMember->isConverted()) {
            return back()->withErrors(['error' => 'Already converted.']);
        }

        $validated = $request->validate([
            'membership_type' => ['required', 'in:full,visitor,youth,child'],
        ]);

        $churchId = auth()->user()->church_id;

        DB::transaction(function () use ($prospectiveMember, $validated, $churchId) {
            $parts     = explode(' ', trim($prospectiveMember->name), 2);
            $firstName = $parts[0];
            $lastName  = $parts[1] ?? '';

            $member = Member::create([
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'email'      => $prospectiveMember->email,
                'phone'      => $prospectiveMember->phone,
                'notes'      => $prospectiveMember->notes,
            ]);

            $member->churches()->attach($churchId, [
                'membership_type' => $validated['membership_type'],
                'is_active'       => true,
                'joined_at'       => now(),
            ]);

            $prospectiveMember->update([
                'converted_member_id' => $member->id,
                'converted_at'        => now(),
                'status'              => 'converted',
                'stage'               => 'established',
                'membership_type'     => $validated['membership_type'],
            ]);
        });

        return back()->with('success', "{$prospectiveMember->name} has been added to the Members list.");
    }

    /**
     * Delete a prospective member record.
     */
    public function destroy(ProspectiveMember $prospectiveMember)
    {
        $name = $prospectiveMember->name;
        $prospectiveMember->delete();
        return back()->with('success', "{$name} removed.");
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private function formatRecord(ProspectiveMember $pm): array
    {
        $parts    = explode(' ', $pm->name, 2);
        $initials = strtoupper(substr($parts[0], 0, 1) . substr($parts[1] ?? '', 0, 1));

        return [
            'id'                => $pm->id,
            'name'              => $pm->name,
            'initials'          => $initials,
            'phone'             => $pm->phone,
            'email'             => $pm->email,
            'location'          => $pm->location,
            'source'            => $pm->source,
            'stage'             => $pm->stage,
            'status'            => $pm->status,
            'date_won'          => $pm->date_won?->toDateString(),
            'notes'             => $pm->notes,
            'brought_by'        => $pm->broughtBy
                ? trim($pm->broughtBy->first_name . ' ' . $pm->broughtBy->last_name)
                : null,
            'brought_by_id'     => $pm->brought_by,
            'followed_up_by'    => $pm->followedUpBy
                ? trim($pm->followedUpBy->first_name . ' ' . $pm->followedUpBy->last_name)
                : null,
            'followed_up_by_id' => $pm->followed_up_by,
            'is_converted'      => $pm->isConverted(),
            'converted_at'      => $pm->converted_at?->toDateString(),
            'member_id'         => $pm->converted_member_id,
            'created_at'        => $pm->created_at->toDateString(),
        ];
    }
}
