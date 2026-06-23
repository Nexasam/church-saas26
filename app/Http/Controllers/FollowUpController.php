<?php

namespace App\Http\Controllers;

use App\Models\FollowUp;
use App\Models\FollowUpTask;
use App\Models\User;
use App\Notifications\FollowUpReminderNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FollowUpController extends Controller
{
    public function index(Request $request)
    {
        $churchId = auth()->user()->church_id;
        $search   = $request->query('search', '');
        $stage    = $request->query('stage', '');

        $query = FollowUp::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['assignedTo:id,name', 'tasks'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->orderBy('days_in_stage', 'desc');

        if ($search) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
        }
        if ($stage) {
            $query->where('stage', $stage);
        }

        $followUps = $query->get()->map(fn($f) => $this->formatFollowUp($f));

        $tasks = FollowUpTask::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['followUp:id,name', 'assignedTo:id,name'])
            ->orderBy('due_date')
            ->limit(100)
            ->get()
            ->map(fn($t) => [
                'id'          => $t->id,
                'follow_up_id'=> $t->follow_up_id,
                'person_name' => $t->followUp?->name ?? '—',
                'type'        => $t->type,
                'assigned_to' => $t->assignedTo?->name ?? '—',
                'due_date'    => $t->due_date?->toDateString(),
                'priority'    => $t->priority,
                'status'      => $t->status,
                'notes'       => $t->notes,
            ]);

        $users = User::where('church_id', $churchId)->get(['id', 'name'])
            ->map(fn($u) => ['id' => $u->id, 'name' => $u->name]);

        $stageCounts = FollowUp::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage');

        return Inertia::render('followups', [
            'followUps'   => $followUps,
            'tasks'       => $tasks,
            'users'       => $users,
            'stageCounts' => $stageCounts,
            'filters'     => ['search' => $search, 'stage' => $stage],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:200'],
            'phone'         => ['nullable', 'string', 'max:30'],
            'stage'         => ['required', 'in:visitor,first_contact,follow_up,membership_class,worker,established'],
            'priority'      => ['required', 'in:low,medium,high,urgent'],
            'source'        => ['nullable', 'string', 'max:100'],
            'assigned_to'   => ['nullable', 'integer', 'exists:users,id'],
            'notes'         => ['nullable', 'string', 'max:2000'],
            'prayer_request'=> ['nullable', 'string', 'max:2000'],
            'next_action'   => ['nullable', 'string', 'max:300'],
        ]);

        FollowUp::create($validated);

        return back()->with('success', "{$validated['name']} added to follow-ups.");
    }

    public function update(Request $request, FollowUp $followUp)
    {
        $validated = $request->validate([
            'stage'         => ['sometimes', 'in:visitor,first_contact,follow_up,membership_class,worker,established'],
            'priority'      => ['sometimes', 'in:low,medium,high,urgent'],
            'assigned_to'   => ['nullable', 'integer', 'exists:users,id'],
            'notes'         => ['nullable', 'string', 'max:2000'],
            'prayer_request'=> ['nullable', 'string', 'max:2000'],
            'next_action'   => ['nullable', 'string', 'max:300'],
        ]);

        $followUp->update($validated);

        return back()->with('success', 'Follow-up updated.');
    }

    public function destroy(FollowUp $followUp)
    {
        $name = $followUp->name;
        $followUp->delete();
        return back()->with('success', "{$name} removed.");
    }

    public function storeTask(Request $request)
    {
        $validated = $request->validate([
            'follow_up_id' => ['required', 'integer', 'exists:follow_ups,id'],
            'type'         => ['required', 'in:call,visit,prayer_meeting,invite_to_service,message'],
            'assigned_to'  => ['nullable', 'integer', 'exists:users,id'],
            'due_date'     => ['nullable', 'date'],
            'priority'     => ['required', 'in:low,medium,high,urgent'],
            'notes'        => ['nullable', 'string', 'max:1000'],
        ]);

        $task = FollowUpTask::create($validated);
        $followUp = FollowUp::find($validated['follow_up_id']);

        // Notify assigned user
        if ($validated['assigned_to']) {
            $assignedUser = User::find($validated['assigned_to']);
            $assignedUser->notify(new FollowUpReminderNotification($followUp, $task));
        }

        return back()->with('success', 'Task created.');
    }

    public function updateTask(Request $request, FollowUpTask $task)
    {
        $validated = $request->validate([
            'status'   => ['sometimes', 'in:pending,in_progress,done,escalated'],
            'priority' => ['sometimes', 'in:low,medium,high,urgent'],
            'notes'    => ['nullable', 'string', 'max:1000'],
        ]);

        $task->update($validated);

        return back()->with('success', 'Task updated.');
    }

    public function destroyTask(FollowUpTask $task)
    {
        $task->delete();
        return back()->with('success', 'Task deleted.');
    }

    private function formatFollowUp(FollowUp $f): array
    {
        $parts = explode(' ', $f->name, 2);
        return [
            'id'             => $f->id,
            'name'           => $f->name,
            'initials'       => strtoupper(substr($parts[0], 0, 1) . substr($parts[1] ?? '', 0, 1)),
            'phone'          => $f->phone,
            'stage'          => $f->stage,
            'priority'       => $f->priority,
            'source'         => $f->source,
            'assigned_to'    => $f->assignedTo?->name ?? '—',
            'assigned_to_id' => $f->assigned_to,
            'notes'          => $f->notes,
            'prayer_request' => $f->prayer_request,
            'next_action'    => $f->next_action ?? 'Follow up required',
            'days_in_stage'  => $f->days_in_stage,
            'last_contact'   => $f->last_contact_at ? $f->last_contact_at->diffForHumans() : 'Not contacted',
            'tags'           => [],
        ];
    }
}


