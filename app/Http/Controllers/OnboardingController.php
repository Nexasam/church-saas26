<?php

namespace App\Http\Controllers;

use App\Models\Church;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    /**
     * Show the onboarding wizard.
     */
    public function show()
    {
        $user   = auth()->user();
        $church = Church::find($user->church_id);

        // Already completed — send to dashboard
        if ($church?->onboarding_complete) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding', [
            'church' => [
                'id'          => $church?->id,
                'name'        => $church?->name ?? '',
                'address'     => $church?->address ?? '',
                'phone'       => $church?->phone ?? '',
                'city'        => $church?->city ?? '',
                'country'     => $church?->country ?? 'Nigeria',
                'size'        => $church?->size ?? 'small',
                'theme_color' => $church?->theme_color ?? 'blue',
            ],
        ]);
    }

    /**
     * Save church profile (step 1).
     */
    public function saveChurch(Request $request)
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'city'    => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'size'    => ['required', 'in:small,medium,large,mega'],
        ]);

        $church = Church::find(auth()->user()->church_id);
        $church->update($validated);

        return back()->with('success', 'Church profile saved.');
    }

    /**
     * Save departments (step 2).
     */
    public function saveDepartments(Request $request)
    {
        $validated = $request->validate([
            'departments'   => ['required', 'array', 'min:1'],
            'departments.*' => ['required', 'string', 'max:100'],
        ]);

        $churchId = auth()->user()->church_id;

        DB::transaction(function () use ($validated, $churchId) {
            foreach ($validated['departments'] as $name) {
                $name = trim($name);
                if ($name) {
                    Department::withoutGlobalScopes()->firstOrCreate(
                        ['church_id' => $churchId, 'name' => $name],
                        ['church_id' => $churchId, 'name' => $name]
                    );
                }
            }
        });

        return back()->with('success', 'Departments saved.');
    }

    /**
     * Save theme (step 3 — optional).
     */
    public function saveTheme(Request $request)
    {
        $validated = $request->validate([
            'theme_color' => ['required', 'in:blue,purple,emerald'],
        ]);

        Church::find(auth()->user()->church_id)->update($validated);

        return back()->with('success', 'Theme saved.');
    }

    /**
     * Simulate payment and complete onboarding (step 4).
     */
    public function completePlan(Request $request)
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:starter,growth,enterprise'],
        ]);

        $church = Church::find(auth()->user()->church_id);

        $church->update([
            'payment_category'   => $validated['plan'] === 'free' ? 'free' : 'paid',
            'subscription_expiry'=> now()->addDays(14), // 14-day trial for all plans
            'onboarding_complete'=> true,
        ]);

        return redirect()->route('dashboard')->with('success', 'Welcome to Church OS! Your 14-day trial has started.');
    }

    /**
     * Skip to dashboard (marks onboarding complete without payment).
     * Only allowed if departments have been saved.
     */
    public function skip(Request $request)
    {
        $church   = Church::find(auth()->user()->church_id);
        $hasDepts = Department::withoutGlobalScopes()
            ->where('church_id', $church->id)
            ->exists();

        if (! $hasDepts) {
            return back()->withErrors(['departments' => 'You must add at least one department before continuing.']);
        }

        $church->update([
            'onboarding_complete' => true,
            'subscription_expiry' => now()->addDays(14),
        ]);

        return redirect()->route('dashboard');
    }
}
