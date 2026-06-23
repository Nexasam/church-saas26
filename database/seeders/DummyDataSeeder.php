<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Church;
use App\Models\User;
use App\Models\Department;
use App\Models\Member;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $church = Church::first();

        if (!$church) {
            $this->command->error('No church found. Please run DatabaseSeeder first.');
            return;
        }

        // Departments to create
        $departments = [
            ['name' => 'Ushering', 'description' => 'Greets and seats members during services', 'icon' => 'Users', 'color' => 'blue'],
            ['name' => 'Music Ministry', 'description' => 'Leads worship and music during services', 'icon' => 'Music', 'color' => 'purple'],
            ['name' => 'Choir', 'description' => 'Provides vocal ministry during services', 'icon' => 'Mic', 'color' => 'pink'],
            ['name' => 'Prayer Team', 'description' => 'Intercedes for the church and members', 'icon' => 'HeartHandshake', 'color' => 'green'],
            ['name' => 'Security', 'description' => 'Ensures safety and order during services', 'icon' => 'Shield', 'color' => 'orange'],
            ['name' => 'Technical', 'description' => 'Manages sound, lighting, and media', 'icon' => 'Monitor', 'color' => 'slate'],
            ['name' => 'Children Ministry', 'description' => 'Ministers to children during services', 'icon' => 'Baby', 'color' => 'yellow'],
            ['name' => 'Hospitality', 'description' => 'Welcomes guests and provides refreshments', 'icon' => 'Coffee', 'color' => 'rose'],
        ];

        $createdDepts = [];
        foreach ($departments as $deptData) {
            $dept = Department::firstOrCreate(
                ['name' => $deptData['name'], 'church_id' => $church->id],
                array_merge($deptData, ['church_id' => $church->id])
            );
            $createdDepts[$deptData['name']] = $dept;
        }

        $this->command->info('Created ' . count($createdDepts) . ' departments.');

        // Create members and worker accounts for each department
        $credentials = [];

        foreach ($createdDepts as $deptName => $department) {
            $this->command->info("Seeding {$deptName}...");

            // Create leader
            $leaderPassword = 'password123';
            $leader = $this->createMemberAndUser($church, $department, 'leader', $leaderPassword);
            $department->update(['leader' => $leader->name, 'leader_id' => $leader->id]);
            $credentials[] = [
                'department' => $deptName,
                'role' => 'Leader',
                'name' => $leader->name,
                'email' => $leader->email,
                'password' => $leaderPassword,
            ];

            // Create 2-3 workers
            for ($i = 1; $i <= 3; $i++) {
                $workerPassword = 'password123';
                $worker = $this->createMemberAndUser($church, $department, 'worker', $workerPassword);
                $credentials[] = [
                    'department' => $deptName,
                    'role' => 'Worker',
                    'name' => $worker->name,
                    'email' => $worker->email,
                    'password' => $workerPassword,
                ];
            }

            // Create 3-5 regular members without user accounts
            for ($i = 1; $i <= 5; $i++) {
                $this->createMemberOnly($church, $department);
            }
        }

        // Display credentials
        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('WORKER PORTAL LOGIN CREDENTIALS');
        $this->command->info('========================================');
        $this->command->newLine();

        foreach ($credentials as $cred) {
            $this->command->info("Department: {$cred['department']}");
            $this->command->info("  Role: {$cred['role']}");
            $this->command->info("  Name: {$cred['name']}");
            $this->command->info("  Email: {$cred['email']}");
            $this->command->info("  Password: {$cred['password']}");
            $this->command->newLine();
        }

        $this->command->info('========================================');
        $this->command->info('All dummy data seeded successfully!');
        $this->command->info('========================================');
    }

    private function createMemberAndUser($church, $department, $role, $password)
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();
        $email = strtolower(str_replace(' ', '', "{$firstName}.{$lastName}.{$role}@{$church->name}.org"));

        // Create member
        $member = Member::firstOrCreate(
            ['email' => $email],
            [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => fake()->phoneNumber(),
                'address' => fake()->address(),
            ]
        );

        // Create user
        User::firstOrCreate(
            ['email' => $email],
            [
                'name' => "{$firstName} {$lastName}",
                'email_verified_at' => now(),
                'password' => Hash::make($password),
                'church_id' => $church->id,
            ]
        );

        // Assign to church
        $church->members()->syncWithoutDetaching([$member->id]);

        // Assign to department with role
        $department->members()->syncWithoutDetaching([
            $member->id => [
                'role' => $role,
                'is_active' => true,
                'joined_at' => now(),
            ]
        ]);

        return $member;
    }

    private function createMemberOnly($church, $department)
    {
        $member = Member::create([
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
        ]);

        // Assign to church
        $church->members()->syncWithoutDetaching([$member->id]);

        // Assign to department as regular member
        $department->members()->syncWithoutDetaching([
            $member->id => [
                'role' => 'member',
                'is_active' => true,
                'joined_at' => now(),
            ]
        ]);
    }
}
