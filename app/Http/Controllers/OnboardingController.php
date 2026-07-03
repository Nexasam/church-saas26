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
            'theme_color' => ['required', 'in:blue,purple,emerald,rose,amber,slate'],
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
            'subscription_expiry'=> now()->addDays(14),
            'onboarding_complete'=> true,
        ]);

        $this->seedDefaultData($church->id);

        return redirect()->route('dashboard')->with('success', 'Welcome to Church OS! Your 14-day trial has started.');
    }

    /**
     * Skip to dashboard (marks onboarding complete without payment).
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

        $this->seedDefaultData($church->id);

        return redirect()->route('dashboard');
    }

    /**
     * Seed default categories for a newly onboarded church.
     */
    private function seedDefaultData(int $churchId): void
    {
        $incomeCategories = [
            ['name' => 'Tithes & Offerings', 'slug' => 'offering', 'type' => 'custom'],
            ['name' => 'Special Offerings',  'slug' => 'special',  'type' => 'custom'],
            ['name' => 'Building Fund',       'slug' => 'building', 'type' => 'custom'],
            ['name' => 'Donations',           'slug' => 'donation', 'type' => 'custom'],
            ['name' => 'Welfare Fund',        'slug' => 'welfare',  'type' => 'custom'],
        ];

        foreach ($incomeCategories as $cat) {
            \App\Models\IncomeCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'slug' => $cat['slug']],
                ['church_id' => $churchId, 'name' => $cat['name'], 'slug' => $cat['slug'], 'type' => $cat['type'], 'is_active' => true]
            );
        }

        $expenseCategories = [
            ['name' => 'Utilities',        'slug' => 'utilities',   'type' => 'custom'],
            ['name' => 'Equipment',        'slug' => 'equipment',   'type' => 'custom'],
            ['name' => 'Welfare',          'slug' => 'welfare_exp', 'type' => 'custom'],
            ['name' => 'Salaries',         'slug' => 'salaries',    'type' => 'custom'],
            ['name' => 'Maintenance',      'slug' => 'maintenance', 'type' => 'custom'],
            ['name' => 'Miscellaneous',    'slug' => 'misc',        'type' => 'custom'],
        ];

        foreach ($expenseCategories as $cat) {
            \App\Models\ExpenseCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'slug' => $cat['slug']],
                ['church_id' => $churchId, 'name' => $cat['name'], 'slug' => $cat['slug'], 'type' => $cat['type'], 'is_active' => true]
            );
        }

        $celebrationCategories = [
            ['name' => 'Birthday',           'icon' => 'Cake',          'color' => 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',     'is_system' => true],
            ['name' => 'Wedding Anniversary','icon' => 'Diamond',       'color' => 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',     'is_system' => true],
            ['name' => 'New Baby',           'icon' => 'Baby',          'color' => 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     'is_system' => true],
            ['name' => 'Graduation',         'icon' => 'GraduationCap', 'color' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'is_system' => true],
            ['name' => 'Job Promotion',      'icon' => 'PartyPopper',   'color' => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 'is_system' => true],
        ];

        foreach ($celebrationCategories as $cat) {
            \App\Models\CelebrationCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'name' => $cat['name']],
                ['church_id' => $churchId, ...$cat]
            );
        }
    }
}

