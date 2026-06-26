<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WorkerController extends Controller
{
    /**
     * Invite a member to become a worker/leader in a department
     */
    public function invite(Request $request)
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'email' => ['nullable', 'email', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:worker,leader'],
        ]);

        $department = Department::withoutGlobalScopes()
            ->where('id', $validated['department_id'])
            ->where('church_id', auth()->user()->church_id)
            ->firstOrFail();

        // Check if member already exists (only if email is provided)
        if ($validated['email']) {
            $member = Member::where('email', $validated['email'])->first();
        } else {
            $member = null;
        }

        if ($member) {
            // Check if already in this department
            $existingMember = $department->members()
                ->where('member_id', $member->id)
                ->first();

            if ($existingMember) {
                return back()->withErrors(['email' => 'This person is already in this department.']);
            }

            // Add to department with worker role
            $department->members()->attach($member->id, [
                'role' => $validated['role'],
                'is_active' => true,
                'joined_at' => now(),
            ]);

            return back()->with('success', "{$member->name} has been added as a {$validated['role']}.");
        }

        // Create new member and add to department
        $nameParts = explode(' ', $validated['name'], 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? '';

        $member = Member::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'] ?? null,
            'phone' => null,
            'address' => null,
        ]);

        $department->members()->attach($member->id, [
            'role' => $validated['role'],
            'is_active' => true,
            'joined_at' => now(),
        ]);

        return back()->with('success', "{$validated['name']} has been added as a {$validated['role']}.");
    }

    /**
     * Worker dashboard
     */
    public function dashboard()
    {
        $user    = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');

        if ($isAdmin) {
            $departments = Department::withoutGlobalScopes()
                ->where('church_id', $user->church_id)
                ->with(['leaders'])
                ->get()
                ->map(fn($dept) => [
                    'id'           => $dept->id,
                    'name'         => $dept->name,
                    'description'  => $dept->description,
                    'icon'         => $dept->icon ?? 'Users',
                    'color'        => $dept->color ?? 'blue',
                    'leader'       => $dept->leaders->first()
                        ? trim($dept->leaders->first()->first_name . ' ' . $dept->leaders->first()->last_name)
                        : ($dept->leader ?? null),
                    'role'         => 'admin',
                    'is_leader'    => true,
                    'joined_at'    => now()->toDateString(),
                    'member_count' => $dept->members()->count(),
                    'is_admin'     => true,
                ]);

            // Admins see all recent campaigns
            $messages = \App\Models\SmsCampaign::withoutGlobalScopes()
                ->where('church_id', $user->church_id)
                ->orderByDesc('created_at')
                ->limit(20)
                ->get()
                ->map(fn($c) => $this->formatCampaign($c));

            return Inertia::render('worker/dashboard', [
                'departments' => $departments,
                'messages'    => $messages,
                'user'        => ['name' => $user->name, 'email' => $user->email, 'is_admin' => true],
            ]);
        }

        // Regular workers
        $member = Member::where('email', $user->email)->first();
        if (!$member) {
            return redirect()->route('dashboard')->withErrors(['error' => 'No member record found.']);
        }

        $deptIds = $member->departments()->pluck('departments.id')->toArray();

        if (empty($deptIds)) {
            return redirect()->route('dashboard')->withErrors(['error' => 'You are not assigned to any department.']);
        }

        $departments = Department::withoutGlobalScopes()
            ->whereIn('id', $deptIds)
            ->with(['leaders'])
            ->get()
            ->map(function ($dept) use ($member) {
                $membership = $dept->members()->where('member_id', $member->id)->first();
                $role       = $membership?->pivot->role ?? 'worker';
                $joinedAt   = null;
                if ($membership?->pivot->joined_at) {
                    try { $joinedAt = \Carbon\Carbon::parse($membership->pivot->joined_at)->toDateString(); } catch (\Exception $e) {}
                }
                return [
                    'id'           => $dept->id,
                    'name'         => $dept->name,
                    'description'  => $dept->description,
                    'icon'         => $dept->icon ?? 'Users',
                    'color'        => $dept->color ?? 'blue',
                    'leader'       => $dept->leaders->first()
                        ? trim($dept->leaders->first()->first_name . ' ' . $dept->leaders->first()->last_name)
                        : ($dept->leader ?? null),
                    'role'         => $role,
                    'is_leader'    => $role === 'leader',
                    'joined_at'    => $joinedAt,
                    'member_count' => $dept->members()->count(),
                    'is_admin'     => false,
                ];
            });

        // Messages: campaigns sent to any of worker's departments OR to them individually
        $deptPatterns = collect($deptIds)->map(fn($id) => "dept:{$id}")->toArray();
        $leaderPatterns = collect($deptIds)->map(fn($id) => "leader:{$id}")->toArray();

        $messages = \App\Models\SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $user->church_id)
            ->where(function ($q) use ($deptPatterns, $leaderPatterns, $member) {
                $q->whereIn('recipient_group', array_merge($deptPatterns, $leaderPatterns, ['all', 'active', 'workers']))
                  ->orWhere(function ($q2) use ($member) {
                      $q2->where('type', 'individual')
                         ->where(function ($q3) use ($member) {
                             $q3->where('recipient_phone', $member->phone)
                                ->orWhere('recipient_name', 'like', '%' . $member->first_name . '%');
                         });
                  });
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($c) => $this->formatCampaign($c));

        return Inertia::render('worker/dashboard', [
            'departments' => $departments,
            'messages'    => $messages,
            'user'        => ['name' => $user->name, 'email' => $user->email, 'is_admin' => false],
        ]);
    }

    private function formatCampaign(\App\Models\SmsCampaign $c): array
    {
        return [
            'id'         => $c->id,
            'title'      => $c->title,
            'message'    => $c->message,
            'type'       => $c->type,
            'group'      => $c->recipient_group,
            'recipients' => $c->recipients_count,
            'sent_at'    => $c->sent_at ? $c->sent_at->diffForHumans() : $c->created_at->diffForHumans(),
            'status'     => $c->status,
        ];
    }

    /**
     * Department view for workers/leaders
     */
    public function department(Department $department)
    {
        $user     = auth()->user();
        $isAdmin  = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');

        // Ensure department belongs to this church
        $department = Department::withoutGlobalScopes()
            ->where('id', $department->id)
            ->where('church_id', $user->church_id)
            ->with('members')
            ->firstOrFail();

        if (!$isAdmin) {
            $member = Member::where('email', $user->email)->first();
            if (!$member) {
                return redirect()->route('dashboard')->withErrors(['error' => 'No member record found.']);
            }
            $membership = $department->members()
                ->where('member_id', $member->id)
                ->whereIn('role', ['worker', 'leader'])
                ->where('is_active', true)
                ->first();
            if (!$membership) {
                return redirect()->route('worker.dashboard')->withErrors(['error' => 'You are not assigned to this department.']);
            }
            $currentWorker = [
                'role'      => $membership->pivot->role,
                'is_leader' => $membership->pivot->role === 'leader',
                'is_admin'  => false,
            ];
        } else {
            $currentWorker = ['role' => 'admin', 'is_leader' => true, 'is_admin' => true];
        }

        $members = $department->members->map(fn ($m) => $this->formatMember($m));

        $totalMembers  = $members->count();
        $activeMembers = $members->where('is_active', true)->count();

        return Inertia::render('worker/department', [
            'department'     => [
                'id'          => $department->id,
                'name'        => $department->name,
                'description' => $department->description,
                'icon'        => $department->icon ?? 'Users',
                'color'       => $department->color ?? 'blue',
                'leader'      => $members->firstWhere('role', 'leader')['name'] ?? null,
            ],
            'members'        => $members->values(),
            'current_worker' => $currentWorker,
            'stats'          => [
                'total_members'   => $totalMembers,
                'active_members'  => $activeMembers,
                'attendance_rate' => 0,
                'present_today'   => 0,
            ],
        ]);
    }

    /**
     * Add a member to a department (leader/admin only).
     */
    public function addMember(Request $request, Department $department)
    {
        $this->authorizeLeader($department);

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:255'],
            'role'  => ['required', 'in:worker,leader'],
        ]);

        $churchId = auth()->user()->church_id;

        // Find existing member by email, or create
        $member = $validated['email']
            ? Member::where('email', $validated['email'])->first()
            : null;

        if (!$member) {
            $parts = explode(' ', trim($validated['name']), 2);
            $member = Member::create([
                'first_name' => $parts[0],
                'last_name'  => $parts[1] ?? '',
                'email'      => $validated['email'] ?? null,
            ]);
            $member->churches()->attach($churchId, [
                'membership_type' => 'full',
                'is_active'       => true,
                'joined_at'       => now(),
            ]);
        }

        // Already in department?
        if ($department->members()->where('member_id', $member->id)->exists()) {
            return back()->withErrors(['email' => 'This person is already in this department.']);
        }

        $department->members()->attach($member->id, [
            'role'      => $validated['role'],
            'is_active' => true,
            'joined_at' => now(),
        ]);

        return back()->with('success', "{$validated['name']} added as {$validated['role']}.");
    }

    /**
     * Mark attendance for department members (leader/admin only).
     */
    public function markAttendance(Request $request, Department $department)
    {
        $this->authorizeLeader($department);

        $validated = $request->validate([
            'service_date' => ['required', 'date'],
            'present_ids'  => ['nullable', 'array'],
            'present_ids.*'=> ['integer'],
            'absent_ids'   => ['nullable', 'array'],
            'absent_ids.*' => ['integer'],
        ]);

        $churchId    = auth()->user()->church_id;
        $serviceDate = $validated['service_date'];
        $serviceName = $department->name . ' Service';
        $markedBy    = auth()->user()->name;

        foreach (($validated['present_ids'] ?? []) as $memberId) {
            \App\Models\ServiceAttendance::withoutGlobalScopes()->updateOrCreate(
                ['church_id' => $churchId, 'member_id' => $memberId, 'service_date' => $serviceDate, 'service_name' => $serviceName],
                ['status' => 'present', 'marked_by' => $markedBy]
            );
        }

        foreach (($validated['absent_ids'] ?? []) as $memberId) {
            \App\Models\ServiceAttendance::withoutGlobalScopes()->updateOrCreate(
                ['church_id' => $churchId, 'member_id' => $memberId, 'service_date' => $serviceDate, 'service_name' => $serviceName],
                ['status' => 'absent', 'marked_by' => $markedBy]
            );
        }

        $count = count($validated['present_ids'] ?? []) + count($validated['absent_ids'] ?? []);
        return back()->with('success', "Attendance marked for {$count} member(s).");
    }

    public function updateMemberRole(Request $request, Department $department, Member $member)
    {
        $this->authorizeLeader($department);
        $validated = $request->validate([
            'role'      => ['required', 'in:member,worker,leader'],
            'is_active' => ['boolean'],
        ]);
        $department->members()->updateExistingPivot($member->id, $validated);
        return back()->with('success', 'Member updated.');
    }

    public function removeMember(Department $department, Member $member)
    {
        $this->authorizeLeader($department);
        $department->members()->detach($member->id);
        return back()->with('success', 'Member removed.');
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function authorizeLeader(Department $department): void
    {
        $user = auth()->user();
        if ($user->is_super_admin || ($user->role && $user->role->slug !== 'member')) return;

        $member = Member::where('email', $user->email)->first();
        $ok = $member && $department->members()
            ->where('member_id', $member->id)
            ->where('role', 'leader')
            ->where('is_active', true)
            ->exists();

        if (!$ok) abort(403, 'Only department leaders can perform this action.');
    }

    private function formatMember(Member $m): array
    {
        $name = trim($m->first_name . ' ' . $m->last_name);
        $parts = explode(' ', $name, 2);
        return [
            'id'               => $m->id,
            'name'             => $name,
            'initials'         => strtoupper(substr($parts[0], 0, 1) . substr($parts[1] ?? '', 0, 1)),
            'phone'            => $m->phone,
            'email'            => $m->email,
            'role'             => $m->pivot->role ?? 'member',
            'is_active'        => (bool) ($m->pivot->is_active ?? true),
            'joined_at'        => $m->pivot->joined_at
                ? \Carbon\Carbon::parse($m->pivot->joined_at)->toDateString()
                : null,
            'attendance_count' => 0,
            'last_attended'    => null,
        ];
    }
}

