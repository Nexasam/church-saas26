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
        $user = auth()->user();
        
        // Admins have total access - show all departments
        if ($user->is_super_admin || ($user->role && $user->role->slug !== 'member')) {
            $departments = Department::withoutGlobalScopes()
                ->where('church_id', $user->church_id)
                ->get()
                ->map(function ($dept) use ($user) {
                    return [
                        'id' => $dept->id,
                        'name' => $dept->name,
                        'description' => $dept->description,
                        'icon' => $dept->icon,
                        'color' => $dept->color,
                        'leader' => $dept->leader,
                        'role' => 'admin',
                        'is_leader' => true,
                        'joined_at' => now()->toDateString(),
                        'member_count' => $dept->members()->count(),
                        'is_admin' => true,
                    ];
                });

            return Inertia::render('worker/dashboard', [
                'departments' => $departments,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => true,
                ],
            ]);
        }

        // Regular workers need to be assigned to departments as workers/leaders
        // Find member associated with this user
        $member = Member::where('email', $user->email)->first();

        if (!$member) {
            return redirect()->route('dashboard')->withErrors(['error' => 'You are not associated with any member record.']);
        }

        // Get departments where this member is a worker or leader
        $departments = Department::withoutGlobalScopes()
            ->whereHas('members', function ($query) use ($member) {
                $query->where('member_id', $member->id)
                      ->whereIn('role', ['worker', 'leader'])
                      ->where('is_active', true);
            })
            ->where('church_id', $user->church_id)
            ->with(['members' => function ($query) use ($member) {
                $query->where('member_id', $member->id);
            }])
            ->get();

        if ($departments->isEmpty()) {
            return redirect()->route('dashboard')->withErrors(['error' => 'You are not assigned to any department as a worker.']);
        }

        $departments = $departments->map(function ($dept) use ($member) {
            $membership = $dept->members->where('id', $member->id)->first();
            $role = $membership ? $membership->pivot->role : 'worker';
            
            // Safely handle joined_at date
            $joinedAt = null;
            if ($membership && $membership->pivot->joined_at) {
                try {
                    if (is_string($membership->pivot->joined_at)) {
                        $joinedAt = \Carbon\Carbon::parse($membership->pivot->joined_at)->toDateString();
                    } elseif (method_exists($membership->pivot->joined_at, 'toDateString')) {
                        $joinedAt = $membership->pivot->joined_at->toDateString();
                    } else {
                        $joinedAt = now()->toDateString();
                    }
                } catch (\Exception $e) {
                    $joinedAt = now()->toDateString();
                }
            } else {
                $joinedAt = now()->toDateString();
            }
            
            return [
                'id' => $dept->id,
                'name' => $dept->name,
                'description' => $dept->description,
                'icon' => $dept->icon,
                'color' => $dept->color,
                'leader' => $dept->leader,
                'role' => $role,
                'is_leader' => $role === 'leader',
                'joined_at' => $joinedAt,
                'member_count' => $dept->members()->count(),
                'is_admin' => false,
            ];
        });

        return Inertia::render('worker/dashboard', [
            'departments' => $departments,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => false,
            ],
        ]);
    }

    /**
     * Department view for workers
     */
    public function department(Department $department)
    {
        $user = auth()->user();
        
        // Admins have total access to all departments
        if ($user->is_super_admin || ($user->role && $user->role->slug !== 'member')) {
            $department = Department::withoutGlobalScopes()
                ->where('id', $department->id)
                ->where('church_id', $user->church_id)
                ->with('members')
                ->firstOrFail();

            $members = $department->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => trim($member->first_name . ' ' . $member->last_name),
                    'phone' => $member->phone,
                    'email' => $member->email,
                    'role' => $member->pivot->role,
                    'is_active' => $member->pivot->is_active,
                    'joined_at' => $member->pivot->joined_at?->toDateString(),
                ];
            });

            return Inertia::render('worker/department', [
                'department' => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                    'icon' => $department->icon,
                    'color' => $department->color,
                    'leader' => $department->leader,
                ],
                'members' => $members,
                'current_worker' => [
                    'role' => 'admin',
                    'is_leader' => true,
                    'is_admin' => true,
                ],
            ]);
        }

        // Regular workers need to be assigned to the department
        $member = Member::where('email', $user->email)->first();

        if (!$member) {
            return redirect()->route('dashboard')->withErrors(['error' => 'You are not associated with any member record.']);
        }

        $membership = $department->members()
            ->where('member_id', $member->id)
            ->whereIn('role', ['worker', 'leader'])
            ->where('is_active', true)
            ->first();

        if (!$membership) {
            return redirect()->route('worker.dashboard')->withErrors(['error' => 'You are not assigned to this department.']);
        }

        $department = Department::withoutGlobalScopes()
            ->where('id', $department->id)
            ->with('members')
            ->firstOrFail();

        $members = $department->members->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => trim($member->first_name . ' ' . $member->last_name),
                'phone' => $member->phone,
                'email' => $member->email,
                'role' => $member->pivot->role,
                'is_active' => $member->pivot->is_active,
                'joined_at' => $member->pivot->joined_at?->toDateString(),
            ];
        });

        return Inertia::render('worker/department', [
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'description' => $department->description,
                'icon' => $department->icon,
                'color' => $department->color,
                'leader' => $department->leader,
            ],
            'members' => $members,
            'current_worker' => [
                'role' => $membership->pivot->role,
                'is_leader' => $membership->pivot->role === 'leader',
                'is_admin' => false,
            ],
        ]);
    }

    /**
     * Update member role in department (leaders only)
     */
    public function updateMemberRole(Request $request, Department $department, Member $member)
    {
        $currentUser = auth()->user();
        
        // Check if current user is a leader in this department or admin
        $isLeader = false;
        if (!$currentUser->is_super_admin && (!$currentUser->role || $currentUser->role->slug === 'member')) {
            $currentMember = Member::where('email', $currentUser->email)->first();
            if ($currentMember) {
                $membership = $department->members()
                    ->where('member_id', $currentMember->id)
                    ->where('role', 'leader')
                    ->where('is_active', true)
                    ->first();
                $isLeader = !!$membership;
            }
            
            if (!$isLeader) {
                abort(403, 'Only department leaders can update member roles.');
            }
        }

        $validated = $request->validate([
            'role' => ['required', 'in:member,worker,leader'],
            'is_active' => ['boolean'],
        ]);

        $department->members()->updateExistingPivot($member->id, $validated);
        return back()->with('success', 'Member updated.');
    }

    /**
     * Remove member from department (leaders only)
     */
    public function removeMember(Department $department, Member $member)
    {
        $currentUser = auth()->user();
        
        // Check if current user is a leader in this department or admin
        $isLeader = false;
        if (!$currentUser->is_super_admin && (!$currentUser->role || $currentUser->role->slug === 'member')) {
            $currentMember = Member::where('email', $currentUser->email)->first();
            if ($currentMember) {
                $membership = $department->members()
                    ->where('member_id', $currentMember->id)
                    ->where('role', 'leader')
                    ->where('is_active', true)
                    ->first();
                $isLeader = !!$membership;
            }
            
            if (!$isLeader) {
                abort(403, 'Only department leaders can remove members.');
            }
        }

        $department->members()->detach($member->id);
        return back()->with('success', 'Member removed from department.');
    }
}

