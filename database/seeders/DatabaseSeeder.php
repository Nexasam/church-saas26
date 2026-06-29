<?php

namespace Database\Seeders;

use App\Models\Church;
use App\Models\User;
use Database\Seeders\DummyDataSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create the church (tenant)
        $church = Church::firstOrCreate(
            ['name' => 'Grace Assembly'],
            [
                'address'        => 'Lagos, Nigeria',
                'has_branches'   => false,
            ]
        );

        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@grace.org'],
            [
                'name'              => 'Pastor Admin',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'church_id'         => $church->id,
            ]
        );

        $this->command->info('Seeded: admin@grace.org / password');

        // Run dummy data seeder
        $this->call(DummyDataSeeder::class);
    }
}
