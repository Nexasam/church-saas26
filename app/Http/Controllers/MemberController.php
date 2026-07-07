<?php

namespace App\Http\Controllers;

use App\Concerns\SanitizesCsv;
use App\Models\Department;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MemberController extends Controller
{
    use SanitizesCsv;
    /**
     * List all members for this church with search + filter.
     */
    public function index(Request $request)
    {
        $churchId = auth()->user()->church_id;

        $members = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))
            ->with([
                'churches' => fn ($q) => $q->where('churches.id', $churchId),
                'departments' => fn ($q) => $q->where('departments.church_id', $churchId)->select('departments.id', 'departments.name'),
            ])
            ->when($request->search, fn ($q, $s) =>
                $q->where(fn ($q2) =>
                    $q2->where('first_name', 'like', "%{$s}%")
                       ->orWhere('last_name',  'like', "%{$s}%")
                       ->orWhere('email',       'like', "%{$s}%")
                       ->orWhere('phone',       'like', "%{$s}%")
                )
            )
            ->when($request->status, fn ($q, $s) =>
                $q->whereHas('churches', fn ($q2) =>
                    $q2->where('churches.id', $churchId)
                       ->where('church_member.is_active', $s === 'active')
                )
            )
            ->when($request->department, fn ($q, $d) =>
                $q->whereHas('departments', fn ($q2) =>
                    $q2->where('departments.id', $d)
                       ->where('departments.church_id', $churchId)
                )
            )
            ->orderBy('first_name')
            ->paginate(50);

        // Pre-fetch attendance rates for all members on this page in one query
        $memberIds = $members->pluck('id')->toArray();
        $now = now();

        // Monthly: Sundays in current month
        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd   = $now->copy()->endOfMonth()->toDateString();

        $monthlyPresent = \App\Models\ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('member_id', $memberIds)
            ->where('status', 'present')
            ->whereBetween('service_date', [$monthStart, $monthEnd])
            ->selectRaw('member_id, COUNT(*) as cnt')
            ->groupBy('member_id')
            ->pluck('cnt', 'member_id')
            ->toArray();

        $monthlyTotal = \App\Models\ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('member_id', $memberIds)
            ->whereBetween('service_date', [$monthStart, $monthEnd])
            ->selectRaw('member_id, COUNT(*) as cnt')
            ->groupBy('member_id')
            ->pluck('cnt', 'member_id')
            ->toArray();

        // Quarterly: last 3 months
        $quarterStart = $now->copy()->subMonths(3)->startOfMonth()->toDateString();

        $quarterPresent = \App\Models\ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('member_id', $memberIds)
            ->where('status', 'present')
            ->whereBetween('service_date', [$quarterStart, $monthEnd])
            ->selectRaw('member_id, COUNT(*) as cnt')
            ->groupBy('member_id')
            ->pluck('cnt', 'member_id')
            ->toArray();

        $quarterTotal = \App\Models\ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereIn('member_id', $memberIds)
            ->whereBetween('service_date', [$quarterStart, $monthEnd])
            ->selectRaw('member_id, COUNT(*) as cnt')
            ->groupBy('member_id')
            ->pluck('cnt', 'member_id')
            ->toArray();

        $members = $members->through(fn (Member $m) => $this->formatMember(
            $m, $churchId,
            $monthlyPresent[$m->id] ?? 0,
            $monthlyTotal[$m->id] ?? 0,
            $quarterPresent[$m->id] ?? 0,
            $quarterTotal[$m->id] ?? 0
        ));

        $departments = Department::where('church_id', $churchId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $stats = [
            'total'    => Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))->count(),
            'active'   => Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true))->count(),
            'inactive' => Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', false))->count(),
        ];

        return Inertia::render('members', [
            'members'     => $members,
            'departments' => $departments,
            'stats'       => $stats,
            'filters'     => $request->only(['search', 'status', 'department']),
        ]);
    }

    /**
     * Store a new member.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'      => ['required', 'string', 'max:100'],
            'last_name'       => ['required', 'string', 'max:100'],
            'email'           => ['nullable', 'email', 'max:255'],
            'phone'           => ['nullable', 'string', 'max:30'],
            'gender'          => ['nullable', 'in:male,female'],
            'dob'             => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'max:500'],
            'occupation'      => ['nullable', 'string', 'max:200'],
            'home_church'     => ['nullable', 'string', 'max:100'],
            'membership_type' => ['required', 'in:full,visitor,youth,child'],
            'joined_at'       => ['nullable', 'date'],
            'department_ids'  => ['nullable', 'array'],
            'department_ids.*'=> ['integer', 'exists:departments,id'],
            'notes'           => ['nullable', 'string', 'max:2000'],
        ]);

        $churchId = auth()->user()->church_id;

        $member = DB::transaction(function () use ($validated, $churchId) {
            $member = Member::create([
                'first_name'  => $validated['first_name'],
                'last_name'   => $validated['last_name'],
                'email'       => $validated['email'] ?? null,
                'phone'       => $validated['phone'] ?? null,
                'gender'      => $validated['gender'] ?? null,
                'dob'         => $validated['dob'] ?? null,
                'address'     => $validated['address'] ?? null,
                'occupation'  => $validated['occupation'] ?? null,
                'home_church' => $validated['home_church'] ?? null,
                'notes'       => $validated['notes'] ?? null,
            ]);

            // Attach to church
            $member->churches()->attach($churchId, [
                'membership_type' => $validated['membership_type'],
                'is_active'       => true,
                'joined_at'       => $validated['joined_at'] ?? now(),
            ]);

            // Attach departments
            if (! empty($validated['department_ids'])) {
                $deptIds = array_filter($validated['department_ids'], fn ($id) =>
                    Department::where('id', $id)->where('church_id', $churchId)->exists()
                );
                foreach ($deptIds as $deptId) {
                    $member->departments()->attach($deptId, [
                        'is_active' => true,
                        'joined_at' => now(),
                    ]);
                }
            }

            return $member;
        });

        return back()->with('success', "{$member->first_name} {$member->last_name} added successfully.");
    }

    /**
     * Update member profile.
     */
    public function update(Request $request, Member $member)
    {
        $churchId = auth()->user()->church_id;
        $this->assertMemberBelongsToChurch($member, $churchId);

        $validated = $request->validate([
            'first_name'      => ['required', 'string', 'max:100'],
            'last_name'       => ['required', 'string', 'max:100'],
            'email'           => ['nullable', 'email', 'max:255'],
            'phone'           => ['nullable', 'string', 'max:30'],
            'gender'          => ['nullable', 'in:male,female'],
            'dob'             => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'max:500'],
            'occupation'      => ['nullable', 'string', 'max:200'],
            'home_church'     => ['nullable', 'string', 'max:100'],
            'membership_type' => ['sometimes', 'in:full,visitor,youth,child'],
            'status'          => ['sometimes', 'in:active,inactive'],
            'department_ids'  => ['nullable', 'array'],
            'department_ids.*'=> ['integer', 'exists:departments,id'],
            'notes'           => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($validated, $member, $churchId) {
            $member->update([
                'first_name'  => $validated['first_name'],
                'last_name'   => $validated['last_name'],
                'email'       => $validated['email'] ?? $member->email,
                'phone'       => $validated['phone'] ?? $member->phone,
                'gender'      => $validated['gender'] ?? $member->gender,
                'dob'         => $validated['dob'] ?? $member->dob,
                'address'     => $validated['address'] ?? $member->address,
                'occupation'  => $validated['occupation'] ?? $member->occupation,
                'home_church' => $validated['home_church'] ?? $member->home_church,
                'notes'       => $validated['notes'] ?? $member->notes,
            ]);

            // Update church pivot
            $pivotUpdate = [];
            if (isset($validated['membership_type'])) {
                $pivotUpdate['membership_type'] = $validated['membership_type'];
            }
            if (isset($validated['status'])) {
                $pivotUpdate['is_active'] = $validated['status'] === 'active';
            }
            if (! empty($pivotUpdate)) {
                $member->churches()->updateExistingPivot($churchId, $pivotUpdate);
            }

            // Sync departments
            if (array_key_exists('department_ids', $validated)) {
                $validDeptIds = collect($validated['department_ids'] ?? [])
                    ->filter(fn ($id) => Department::where('id', $id)->where('church_id', $churchId)->exists())
                    ->toArray();

                // Detach old dept memberships for this church, reattach new ones
                $member->departments()
                    ->wherePivot('church_id', $churchId)
                    ->detach();

                foreach ($validDeptIds as $deptId) {
                    $member->departments()->attach($deptId, [
                        'is_active' => true,
                        'joined_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Member updated.');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(Member $member)
    {
        $churchId = auth()->user()->church_id;
        $this->assertMemberBelongsToChurch($member, $churchId);

        $current = $member->churches()
            ->where('churches.id', $churchId)
            ->first()?->pivot->is_active ?? true;

        $member->churches()->updateExistingPivot($churchId, ['is_active' => ! $current]);

        return back()->with('success', ! $current ? 'Member reactivated.' : 'Member deactivated.');
    }

    /**
     * Delete a member from this church.
     */
    public function destroy(Member $member)
    {
        $churchId = auth()->user()->church_id;
        $this->assertMemberBelongsToChurch($member, $churchId);

        // Detach from this church only (not deleted globally if multi-church)
        $member->churches()->detach($churchId);
        $member->departments()->whereHas('church', fn ($q) => $q->where('id', $churchId))->detach();

        // If member has no other churches, delete the record
        if ($member->churches()->count() === 0) {
            $member->delete();
        }

        return back()->with('success', 'Member removed.');
    }

    /**
     * Bulk import members from an uploaded CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $churchId = auth()->user()->church_id;
        $created  = 0;
        $handle   = fopen($request->file('file')->getPathname(), 'r');

        // Skip header row
        $header = fgetcsv($handle);
        // Normalize header keys
        $keys = array_map(fn ($h) => strtolower(trim(str_replace([' ', '-'], '_', $h))), $header);

        DB::transaction(function () use ($handle, $keys, $churchId, &$created) {
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($keys, array_pad($row, count($keys), ''));
                $firstName = trim($data['first_name'] ?? $data['firstname'] ?? '');
                $lastName  = trim($data['last_name']  ?? $data['lastname']  ?? $data['surname'] ?? '');

                if (! $firstName) continue;

                $member = Member::create([
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'email'      => $data['email']  ? trim($data['email'])  : null,
                    'phone'      => $data['phone']  ? trim($data['phone'])  : null,
                    'gender'     => in_array(strtolower($data['gender'] ?? ''), ['male','female']) ? strtolower($data['gender']) : null,
                    'dob'        => $data['dob'] ? trim($data['dob']) : null,
                ]);

                $member->churches()->attach($churchId, [
                    'membership_type' => in_array($data['membership_type'] ?? '', ['full','visitor','youth','child'])
                        ? $data['membership_type']
                        : 'full',
                    'is_active' => true,
                    'joined_at' => $data['joined_at'] ?? now(),
                ]);
                $created++;
            }
        });

        fclose($handle);

        return back()->with('success', "{$created} members imported successfully.");
    }

    /**
     * Export members as CSV.
     */
    public function export(Request $request)
    {
        $churchId = auth()->user()->church_id;

        $members = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))
            ->with([
                'churches'    => fn ($q) => $q->where('churches.id', $churchId),
                'departments' => fn ($q) => $q->where('departments.church_id', $churchId),
            ])
            ->orderBy('first_name')
            ->get();

        $rows   = [];
        $rows[] = ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'DOB', 'Address', 'Occupation', 'Membership Type', 'Status', 'Joined', 'Departments', 'Home Church'];

        foreach ($members as $m) {
            $pivot = $m->churches->first()?->pivot;
            $rows[] = $this->sanitizeCsvRow([
                $m->first_name,
                $m->last_name,
                $m->email ?? '',
                $m->phone ?? '',
                $m->gender ?? '',
                $m->dob ?? '',
                $m->address ?? '',
                $m->occupation ?? '',
                $pivot?->membership_type ?? '',
                $pivot?->is_active ? 'Active' : 'Inactive',
                $pivot?->joined_at ?? '',
                $m->departments->pluck('name')->join(' | '),
                $m->home_church ?? '',
            ]);
        }

        $csv      = implode("\n", array_map(fn ($r) => $this->rowToCsv($r), $rows));
        $filename = 'members_' . date('Y-m-d') . '.csv';

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function assertMemberBelongsToChurch(Member $member, int $churchId): void
    {
        $belongs = $member->churches()->where('churches.id', $churchId)->exists();
        if (! $belongs) {
            abort(403, 'This member does not belong to your church.');
        }
    }

    private function formatMember(Member $m, int $churchId, int $monthlyPresent = 0, int $monthlyTotal = 0, int $quarterPresent = 0, int $quarterTotal = 0): array
    {
        $pivot = $m->churches->first()?->pivot;
        $monthlyRate  = $monthlyTotal  > 0 ? round(($monthlyPresent  / $monthlyTotal)  * 100) : 0;
        $quarterRate  = $quarterTotal  > 0 ? round(($quarterPresent  / $quarterTotal)  * 100) : 0;

        return [
            'id'              => $m->id,
            'name'            => $m->first_name . ' ' . $m->last_name,
            'first_name'      => $m->first_name,
            'last_name'       => $m->last_name,
            'initials'        => strtoupper(substr($m->first_name, 0, 1) . substr($m->last_name, 0, 1)),
            'email'           => $m->email,
            'phone'           => $m->phone,
            'gender'          => $m->gender,
            'dob'             => $m->dob?->toDateString(),
            'address'         => $m->address,
            'occupation'      => $m->occupation,
            'home_church'     => $m->home_church,
            'notes'           => $m->notes,
            'follow_up_stage' => $m->follow_up_stage ?? 'visitor',
            'membership_type' => $pivot?->membership_type ?? 'full',
            'status'          => $pivot?->is_active ? 'active' : 'inactive',
            'joined_at'       => $pivot?->joined_at
                ? \Carbon\Carbon::parse($pivot->joined_at)->toDateString()
                : null,
            'departments'     => $m->departments->pluck('name')->toArray(),
            'department_ids'  => $m->departments->pluck('id')->toArray(),
            'attendance_rate' => $monthlyRate,   // monthly (default shown)
            'quarterly_rate'  => $quarterRate,
            'monthly_sessions'  => $monthlyTotal,
            'quarterly_sessions'=> $quarterTotal,
            'created_at'      => $m->created_at->toDateString(),
        ];
    }
}
