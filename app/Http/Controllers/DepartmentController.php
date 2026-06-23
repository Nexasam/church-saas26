<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $churchId = $user->church_id;

        // Check if user is admin (not a regular member role)
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');

        if ($isAdmin) {
            // Admins see all departments
            $departments = Department::withoutGlobalScopes()
                ->where('church_id', $churchId)
                ->withCount(['members as member_count', 'members as active_count' => fn($q) => $q->where('department_member.is_active', true)])
                ->orderBy('name')
                ->get();
        } else {
            // Workers only see departments they're assigned to
            $member = Member::where('email', $user->email)->first();
            
            if (!$member) {
                $departments = collect();
            } else {
                $departments = Department::withoutGlobalScopes()
                    ->where('church_id', $churchId)
                    ->whereHas('members', function ($query) use ($member) {
                        $query->where('member_id', $member->id)
                              ->whereIn('role', ['worker', 'leader'])
                              ->where('is_active', true);
                    })
                    ->withCount(['members as member_count', 'members as active_count' => fn($q) => $q->where('department_member.is_active', true)])
                    ->orderBy('name')
                    ->get();
            }
        }

        $departments = $departments->map(fn($d) => [
            'id'           => $d->id,
            'name'         => $d->name,
            'description'  => $d->description ?? '',
            'icon'         => $d->icon ?? 'Users',
            'color'        => $d->color ?? 'blue',
            'leader'       => $d->leader ?? '',
            'leader_id'    => $d->leader_id ?? null,
            'member_count' => $d->member_count,
            'active_count' => $d->active_count,
            'created_at'   => $d->created_at->toDateString(),
            'last_activity'=> $d->updated_at->toDateString(),
            'user_role'    => $this->getUserRoleInDepartment($user, $d),
        ]);

        // Only admins can add members to any department
        // Workers can only see members from their assigned departments
        if ($isAdmin) {
            $members = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'phone'])
                ->map(fn($m) => [
                    'id'       => $m->id,
                    'name'     => trim($m->first_name . ' ' . $m->last_name),
                    'initials' => strtoupper(substr($m->first_name, 0, 1) . substr($m->last_name, 0, 1)),
                    'phone'    => $m->phone,
                ]);
        } else {
            $members = collect();
        }

        return Inertia::render('departments', [
            'departments' => $departments,
            'members'     => $members,
            'is_admin'    => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        // Only admins can create departments
        $user = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');
        
        if (!$isAdmin) {
            abort(403, 'Only admins can create departments.');
        }

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:500'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'max:50'],
            'leader'      => ['nullable', 'string', 'max:200'],
            'leader_id'   => ['nullable', 'integer', 'exists:members,id'],
        ]);

        Department::create($validated);

        return back()->with('success', "Department \"{$validated['name']}\" created.");
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');
        
        // Bypass global scope to find the department
        $department = Department::withoutGlobalScopes()->findOrFail($id);

        // Check if user has access to this department
        if (!$isAdmin) {
            $member = Member::where('email', $user->email)->first();
            if (!$member) {
                abort(403, 'You do not have access to this department.');
            }
            
            $membership = $department->members()
                ->where('member_id', $member->id)
                ->whereIn('role', ['worker', 'leader'])
                ->where('is_active', true)
                ->first();
            
            if (!$membership) {
                abort(403, 'You do not have access to this department.');
            }
            
            // Only leaders can edit department details
            if ($membership->pivot->role !== 'leader') {
                abort(403, 'Only department leaders can edit department details.');
            }
        }

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:500'],
            'icon'        => ['nullable', 'string', 'max:50'],
            'color'       => ['nullable', 'string', 'max:50'],
            'leader'      => ['nullable', 'string', 'max:200'],
            'leader_id'   => ['nullable', 'integer', 'exists:members,id'],
        ]);

        $department->update($validated);

        return back()->with('success', "\"{$department->name}\" updated.");
    }

    public function destroy($id)
    {
        // Only admins can delete departments
        $user = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');
        
        if (!$isAdmin) {
            abort(403, 'Only admins can delete departments.');
        }

        // Bypass global scope to find the department
        $department = Department::withoutGlobalScopes()->findOrFail($id);

        $name = $department->name;
        $department->members()->detach();
        $department->delete();
        return back()->with('success', "\"{$name}\" deleted.");
    }

    /** Get members in a department (JSON for the detail sheet) */
    public function members($id)
    {
        // Bypass global scope to find the department
        $department = Department::withoutGlobalScopes()->findOrFail($id);

        $members = $department->members()
            ->get(['members.id', 'first_name', 'last_name', 'phone', 'department_member.is_active', 'department_member.role'])
            ->map(fn($m) => [
                'id'       => $m->id,
                'name'     => trim($m->first_name . ' ' . $m->last_name),
                'initials' => strtoupper(substr($m->first_name, 0, 1) . substr($m->last_name, 0, 1)),
                'phone'    => $m->phone,
                'is_active'=> (bool) $m->pivot->is_active,
                'role'     => $m->pivot->role,
            ]);

        return response()->json($members);
    }

    /** Add members to a department */
    public function addMembers(Request $request, $id)
    {
        $user = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');
        
        // Bypass global scope to find the department
        $department = Department::withoutGlobalScopes()->findOrFail($id);

        // Check if user has access to this department
        if (!$isAdmin) {
            $member = Member::where('email', $user->email)->first();
            if (!$member) {
                abort(403, 'You do not have access to this department.');
            }
            
            $membership = $department->members()
                ->where('member_id', $member->id)
                ->whereIn('role', ['worker', 'leader'])
                ->where('is_active', true)
                ->first();
            
            if (!$membership) {
                abort(403, 'You do not have access to this department.');
            }
            
            // Only leaders can add members
            if ($membership->pivot->role !== 'leader') {
                abort(403, 'Only department leaders can add members.');
            }
        }

        $validated = $request->validate([
            'member_ids'   => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ]);

        // Verify all members belong to the same church as the department
        $churchId = $department->church_id;
        $validMemberIds = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->whereIn('id', $validated['member_ids'])
            ->pluck('id')
            ->toArray();

        $invalidIds = array_diff($validated['member_ids'], $validMemberIds);
        if (!empty($invalidIds)) {
            return back()->with('error', 'Some members do not belong to this church.');
        }

        $syncData = array_fill_keys($validMemberIds, ['role' => 'member', 'is_active' => true, 'joined_at' => now()]);
        $department->members()->syncWithoutDetaching($syncData);

        $count = count($validMemberIds);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => "{$count} member(s) added to {$department->name}."]);
        }

        return back()->with('success', "{$count} member(s) added to {$department->name}.");
    }

    /** Remove a single member from a department */
    public function removeMember($departmentId, $memberId)
    {
        $user = auth()->user();
        $isAdmin = $user->is_super_admin || ($user->role && $user->role->slug !== 'member');
        
        // Bypass global scope to find the department
        $department = Department::withoutGlobalScopes()->findOrFail($departmentId);
        $member = Member::findOrFail($memberId);

        // Check if user has access to this department
        if (!$isAdmin) {
            $currentMember = Member::where('email', $user->email)->first();
            if (!$currentMember) {
                abort(403, 'You do not have access to this department.');
            }
            
            $membership = $department->members()
                ->where('member_id', $currentMember->id)
                ->whereIn('role', ['worker', 'leader'])
                ->where('is_active', true)
                ->first();
            
            if (!$membership) {
                abort(403, 'You do not have access to this department.');
            }
            
            // Only leaders can remove members
            if ($membership->pivot->role !== 'leader') {
                abort(403, 'Only department leaders can remove members.');
            }
        }
        
        $department->members()->detach($member->id);
        return back()->with('success', "{$member->first_name} removed from {$department->name}.");
    }

    /**
     * Get the user's role in a specific department
     */
    private function getUserRoleInDepartment($user, $department)
    {
        if ($user->is_super_admin || ($user->role && $user->role->slug !== 'member')) {
            return 'admin';
        }

        $member = Member::where('email', $user->email)->first();
        if (!$member) {
            return null;
        }

        $membership = $department->members()
            ->where('member_id', $member->id)
            ->whereIn('role', ['worker', 'leader'])
            ->where('is_active', true)
            ->first();

        return $membership ? $membership->pivot->role : null;
    }
}
