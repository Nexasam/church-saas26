<?php

namespace App\Http\Controllers;

use App\Models\CareCase;
use App\Models\Celebration;
use App\Models\CelebrationCategory;
use App\Models\Member;
use App\Models\PrayerRequest;
use App\Models\User;
use App\Notifications\CelebrationNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoveController extends Controller
{
    public function index()
    {
        $churchId = auth()->user()->church_id;

        // ── Care cases ──────────────────────────────────────────────────────
        $cases = CareCase::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['notes', 'assignedTo:id,name'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'member_name' => $c->member_name,
                'type'        => $c->type,
                'title'       => $c->title,
                'description' => $c->description,
                'status'      => $c->status,
                'priority'    => $c->priority,
                'assigned_to' => $c->assignedTo?->name,
                'notes'       => $c->notes->pluck('note')->toArray(),
                'created_at'  => $c->created_at->toDateString(),
                'updated_at'  => $c->updated_at->toDateString(),
            ]);

        // ── Celebration categories ──────────────────────────────────────────
        $categories = CelebrationCategory::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'description' => $c->description ?? '',
                'icon'        => $c->icon,
                'color'       => $c->color,
                'is_system'   => (bool) $c->is_system,
            ]);

        // ── Celebrations ────────────────────────────────────────────────────
        $celebrations = Celebration::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with('category:id,name,icon,color')
            ->orderBy('date')
            ->limit(100)
            ->get()
            ->map(fn($c) => [
                'id'           => $c->id,
                'member_id'    => $c->member_id,
                'member_name'  => $c->member_name,
                'initials'     => collect(explode(' ', $c->member_name))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join(''),
                'category_id'  => $c->category_id,
                'date'         => $c->date->toDateString(),
                'note'         => $c->note,
                'acknowledged' => (bool) $c->acknowledged,
            ]);

        // ── Prayer requests ─────────────────────────────────────────────────
        $prayers = PrayerRequest::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'member_name' => $p->member_name,
                'initials'    => $p->initials ?? collect(explode(' ', $p->member_name))->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join(''),
                'request'     => $p->request,
                'resolved'    => (bool) $p->resolved,
                'date'        => $p->created_at->toDateString(),
            ]);

        $members = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn($m) => ['id' => $m->id, 'name' => trim($m->first_name . ' ' . $m->last_name)]);

        $admins = User::where('church_id', $churchId)->get(['id', 'name'])
            ->map(fn($u) => ['id' => $u->id, 'name' => $u->name]);

        return Inertia::render('love', [
            'cases'        => $cases,
            'categories'   => $categories,
            'celebrations' => $celebrations,
            'prayers'      => $prayers,
            'members'      => $members,
            'admins'       => $admins,
        ]);
    }

    // ── Care case sub-actions ───────────────────────────────────────────────

    public function storeCareCase(Request $request)
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

        CareCase::create($validated);
        return back()->with('success', 'Care case created.');
    }

    public function updateCareCase(Request $request, CareCase $careCase)
    {
        $validated = $request->validate([
            'status'      => ['sometimes', 'in:open,in_progress,resolved,escalated'],
            'priority'    => ['sometimes', 'in:low,medium,high,urgent'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);
        $careCase->update($validated);
        return back()->with('success', 'Care case updated.');
    }

    public function addCareNote(Request $request, CareCase $careCase)
    {
        $request->validate(['note' => ['required', 'string', 'max:2000']]);
        $careCase->notes()->create(['note' => $request->note, 'logged_by' => auth()->id()]);
        return back()->with('success', 'Note added.');
    }

    // ── Celebration sub-actions ─────────────────────────────────────────────

    public function storeCelebration(Request $request)
    {
        $validated = $request->validate([
            'member_id'   => ['nullable', 'integer', 'exists:members,id'],
            'member_name' => ['required', 'string', 'max:200'],
            'category_id' => ['required', 'integer', 'exists:celebration_categories,id'],
            'date'        => ['required', 'date'],
            'note'        => ['nullable', 'string', 'max:500'],
        ]);

        $celebration = Celebration::create($validated);

        // Notify all admins in the church about the celebration
        $admins = User::where('church_id', auth()->user()->church_id)->get();
        foreach ($admins as $admin) {
            $admin->notify(new CelebrationNotification($celebration));
        }

        return back()->with('success', 'Celebration added.');
    }

    public function acknowledgeCelebration(Celebration $celebration)
    {
        $celebration->update(['acknowledged' => true, 'acknowledged_at' => now()]);
        return back()->with('success', 'Celebration acknowledged.');
    }

    public function destroyCelebration(Celebration $celebration)
    {
        $celebration->delete();
        return back()->with('success', 'Celebration removed.');
    }

    // ── Category sub-actions ────────────────────────────────────────────────

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:300'],
            'icon'        => ['required', 'string', 'max:50'],
            'color'       => ['required', 'string', 'max:200'],
        ]);

        CelebrationCategory::create($validated);
        return back()->with('success', 'Category created.');
    }

    public function destroyCategory(CelebrationCategory $category)
    {
        if ($category->is_system) {
            return back()->withErrors(['error' => 'Cannot delete system categories.']);
        }
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }

    // ── Prayer request sub-actions ──────────────────────────────────────────

    public function storePrayer(Request $request)
    {
        $validated = $request->validate([
            'member_id'   => ['nullable', 'integer', 'exists:members,id'],
            'member_name' => ['required', 'string', 'max:200'],
            'request'     => ['required', 'string', 'max:2000'],
        ]);

        $initials = collect(explode(' ', $validated['member_name']))
            ->map(fn($w) => strtoupper($w[0] ?? ''))->take(2)->join('');

        PrayerRequest::create(array_merge($validated, ['initials' => $initials]));
        return back()->with('success', 'Prayer request added.');
    }

    public function resolvePrayer(PrayerRequest $prayer)
    {
        $prayer->update(['resolved' => ! $prayer->resolved, 'resolved_at' => $prayer->resolved ? null : now()]);
        return back()->with('success', $prayer->resolved ? 'Marked as answered.' : 'Reopened.');
    }

    public function destroyPrayer(PrayerRequest $prayer)
    {
        $prayer->delete();
        return back()->with('success', 'Prayer request removed.');
    }
}


