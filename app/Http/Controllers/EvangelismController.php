<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use App\Models\ProspectiveMember;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvangelismController extends Controller
{
    /**
     * Show the evangelism page with funnel data + records.
     */
    public function index()
    {
        $churchId = auth()->user()->church_id;

        // Funnel counts
        $stages = ['soul_won', 'visited', 'membership_class', 'worker', 'established'];
        $counts = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');

        $funnelData = collect($stages)->map(fn ($stage) => [
            'stage' => $stage,
            'count' => $counts[$stage] ?? 0,
        ])->values();

        $total = $funnelData->sum('count') ?: 1;

        $funnelData = $funnelData->map(fn ($item) => [
            ...$item,
            'pct' => round(($item['count'] / $total) * 100),
        ]);

        // Source breakdown
        $sources = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source');

        // All records
        $records = ProspectiveMember::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['broughtBy', 'followedUpBy', 'convertedMember'])
            ->orderByDesc('date_won')
            ->orderByDesc('created_at')
            ->paginate(50)
            ->through(fn (ProspectiveMember $pm) => $this->formatRecord($pm));

        // Leaderboard — top "brought_by" members
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
                'name'      => $row->broughtBy?->first_name . ' ' . $row->broughtBy?->last_name,
                'initials'  => strtoupper(substr($row->broughtBy?->first_name ?? 'U', 0, 1) . substr($row->broughtBy?->last_name ?? 'U', 0, 1)),
                'count'     => $row->count,
            ]);

        // Members list for "brought by" / "follow-up" dropdowns
        $members = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn ($m) => ['id' => $m->id, 'name' => $m->first_name . ' ' . $m->last_name]);

        return Inertia::render('evangelism', [
            'funnelData'    => $funnelData,
            'sourceBreakdown' => $sources,
            'records'       => $records,
            'leaderboard'   => $leaderboard,
            'members'       => $members,
            'stats'         => [
                'total'       => $funnelData->sum('count'),
                'established' => $counts['established'] ?? 0,
                'converted'   => ProspectiveMember::withoutGlobalScopes()->where('church_id', $churchId)->whereNotNull('converted_at')->count(),
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
     * Update stage, status, or notes.
     */
    public function update(Request $request, ProspectiveMember $prospectiveMember)
    {
        $request->merge([
            'followed_up_by' => $request->input('followed_up_by') ?: null,
        ]);

        $validated = $request->validate([
            'stage'          => ['sometimes', 'in:soul_won,visited,membership_class,worker,established'],
            'status'         => ['sometimes', 'in:new,contacted,visited,converted,inactive'],
            'followed_up_by' => ['nullable', 'integer', 'exists:members,id'],
            'notes'          => ['nullable', 'string', 'max:2000'],
            'name'           => ['sometimes', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
        ]);

        $prospectiveMember->update($validated);

        return back()->with('success', 'Record updated.');
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
            // Parse name
            $parts     = explode(' ', trim($prospectiveMember->name), 2);
            $firstName = $parts[0];
            $lastName  = $parts[1] ?? '';

            // Create member record
            $member = Member::create([
                'first_name' => $firstName,
                'last_name'  => $lastName,
                'email'      => $prospectiveMember->email,
                'phone'      => $prospectiveMember->phone,
                'notes'      => $prospectiveMember->notes,
            ]);

            // Attach to church
            $member->churches()->attach($churchId, [
                'membership_type' => $validated['membership_type'],
                'is_active'       => true,
                'joined_at'       => now(),
            ]);

            // Update prospective member record
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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function formatRecord(ProspectiveMember $pm): array
    {
        $nameParts = explode(' ', $pm->name, 2);
        $initials  = strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[1] ?? '', 0, 1));

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
            'brought_by'        => $pm->broughtBy ? $pm->broughtBy->first_name . ' ' . $pm->broughtBy->last_name : null,
            'brought_by_id'     => $pm->brought_by,
            'followed_up_by'    => $pm->followedUpBy ? $pm->followedUpBy->first_name . ' ' . $pm->followedUpBy->last_name : null,
            'followed_up_by_id' => $pm->followed_up_by,
            'is_converted'      => $pm->isConverted(),
            'converted_at'      => $pm->converted_at?->toDateString(),
            'member_id'         => $pm->converted_member_id,
            'created_at'        => $pm->created_at->toDateString(),
        ];
    }
}
