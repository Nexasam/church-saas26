<?php

namespace App\Http\Controllers;

use App\Models\CareCase;
use App\Models\CareCaseNote;
use App\Models\Member;
use App\Models\User;
use App\Notifications\CareCaseAssignedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CareController extends Controller
{
    public function index(Request $request)
    {
        $churchId     = auth()->user()->church_id;
        $search       = $request->query('search', '');
        $statusFilter = $request->query('status', 'all');

        $query = CareCase::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['notes', 'assignedTo:id,name'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q->where('member_name', 'like', "%{$search}%")->orWhere('title', 'like', "%{$search}%"));
        }
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $cases = $query->get()->map(fn($c) => $this->formatCase($c));

        $admins = User::where('church_id', $churchId)->get(['id', 'name'])
            ->map(fn($u) => ['id' => $u->id, 'name' => $u->name]);

        $members = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn($m) => ['id' => $m->id, 'name' => trim($m->first_name . ' ' . $m->last_name)]);

        return Inertia::render('care', [
            'cases'   => $cases,
            'admins'  => $admins,
            'members' => $members,
            'stats'   => [
                'open'        => CareCase::withoutGlobalScopes()->where('church_id', $churchId)->where('status', 'open')->count(),
                'in_progress' => CareCase::withoutGlobalScopes()->where('church_id', $churchId)->where('status', 'in_progress')->count(),
                'urgent'      => CareCase::withoutGlobalScopes()->where('church_id', $churchId)->where('priority', 'urgent')->whereNotIn('status', ['resolved'])->count(),
            ],
            'filters' => ['search' => $search, 'status' => $statusFilter],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id'   => ['nullable', 'integer', 'exists:members,id'],
            'member_name' => ['required', 'string', 'max:200'],
            'type'        => ['required', 'in:hospital,bereavement,counseling,crisis,prayer,general'],
            'title'       => ['required', 'string', 'max:300'],
            'description' => ['nullable', 'string', 'max:2000'],
            'priority'    => ['required', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $careCase = CareCase::create($validated);

        // Notify assigned user
        if ($validated['assigned_to']) {
            $assignedUser = User::find($validated['assigned_to']);
            $assignedUser->notify(new CareCaseAssignedNotification($careCase));
        }

        return back()->with('success', 'Care case created.');
    }

    public function update(Request $request, CareCase $careCase)
    {
        $validated = $request->validate([
            'status'      => ['sometimes', 'in:open,in_progress,resolved,escalated'],
            'priority'    => ['sometimes', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        // Notify if assignment changed
        if (isset($validated['assigned_to']) && $validated['assigned_to'] != $careCase->assigned_to) {
            $careCase->update($validated);
            if ($validated['assigned_to']) {
                $assignedUser = User::find($validated['assigned_to']);
                $assignedUser->notify(new CareCaseAssignedNotification($careCase));
            }
        } else {
            $careCase->update($validated);
        }

        return back()->with('success', 'Case updated.');
    }

    public function destroy(CareCase $careCase)
    {
        $careCase->delete();
        return back()->with('success', 'Case removed.');
    }

    public function storeNote(Request $request, CareCase $careCase)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $careCase->notes()->create([
            'note'      => $validated['note'],
            'logged_by' => auth()->id(),
        ]);

        return back()->with('success', 'Note added.');
    }

    private function formatCase(CareCase $c): array
    {
        return [
            'id'          => $c->id,
            'member_id'   => $c->member_id,
            'member_name' => $c->member_name,
            'type'        => $c->type,
            'title'       => $c->title,
            'description' => $c->description,
            'status'      => $c->status,
            'priority'    => $c->priority,
            'assigned_to' => $c->assignedTo?->name,
            'assigned_to_id' => $c->assigned_to,
            'notes'       => $c->notes->map(fn($n) => [
                'id'        => $n->id,
                'note'      => $n->note,
                'logged_by' => $n->loggedBy?->name ?? 'Staff',
                'created_at'=> $n->created_at->diffForHumans(),
            ])->toArray(),
            'created_at'  => $c->created_at->toDateString(),
            'updated_at'  => $c->updated_at->toDateString(),
        ];
    }
}


