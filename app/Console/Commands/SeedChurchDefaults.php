<?php

namespace App\Console\Commands;

use App\Models\CelebrationCategory;
use App\Models\Church;
use App\Models\ExpenseCategory;
use App\Models\IncomeCategory;
use Illuminate\Console\Command;

class SeedChurchDefaults extends Command
{
    protected $signature   = 'church:seed-defaults {--church= : Specific church ID, or all if omitted}';
    protected $description = 'Seed default income/expense categories and celebration categories for existing churches.';

    public function handle(): int
    {
        $churches = $this->option('church')
            ? Church::where('id', $this->option('church'))->get()
            : Church::all();

        foreach ($churches as $church) {
            $this->seedForChurch($church->id);
            $this->info("Seeded defaults for: {$church->name} (ID {$church->id})");
        }

        $this->info('Done.');
        return 0;
    }

    private function seedForChurch(int $churchId): void
    {
        $incomeCategories = [
            ['name' => 'Tithes & Offerings', 'slug' => 'offering', 'type' => 'custom'],
            ['name' => 'Special Offerings',  'slug' => 'special',  'type' => 'custom'],
            ['name' => 'Building Fund',       'slug' => 'building', 'type' => 'custom'],
            ['name' => 'Donations',           'slug' => 'donation', 'type' => 'custom'],
            ['name' => 'Welfare Fund',        'slug' => 'welfare',  'type' => 'custom'],
        ];

        foreach ($incomeCategories as $cat) {
            IncomeCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'slug' => $cat['slug']],
                ['church_id' => $churchId, ...$cat, 'is_active' => true]
            );
        }

        $expenseCategories = [
            ['name' => 'Utilities',     'slug' => 'utilities',   'type' => 'custom'],
            ['name' => 'Equipment',     'slug' => 'equipment',   'type' => 'custom'],
            ['name' => 'Welfare',       'slug' => 'welfare_exp', 'type' => 'custom'],
            ['name' => 'Salaries',      'slug' => 'salaries',    'type' => 'custom'],
            ['name' => 'Maintenance',   'slug' => 'maintenance', 'type' => 'custom'],
            ['name' => 'Miscellaneous', 'slug' => 'misc',        'type' => 'custom'],
        ];

        foreach ($expenseCategories as $cat) {
            ExpenseCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'slug' => $cat['slug']],
                ['church_id' => $churchId, ...$cat, 'is_active' => true]
            );
        }

        $celebrationCategories = [
            ['name' => 'Birthday',            'icon' => 'Cake',          'color' => 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',     'is_system' => true],
            ['name' => 'Wedding Anniversary', 'icon' => 'Diamond',       'color' => 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',     'is_system' => true],
            ['name' => 'New Baby',            'icon' => 'Baby',          'color' => 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     'is_system' => true],
            ['name' => 'Graduation',          'icon' => 'GraduationCap', 'color' => 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'is_system' => true],
            ['name' => 'Job Promotion',       'icon' => 'PartyPopper',   'color' => 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', 'is_system' => true],
        ];

        foreach ($celebrationCategories as $cat) {
            CelebrationCategory::withoutGlobalScopes()->firstOrCreate(
                ['church_id' => $churchId, 'name' => $cat['name']],
                ['church_id' => $churchId, ...$cat]
            );
        }
    }
}

