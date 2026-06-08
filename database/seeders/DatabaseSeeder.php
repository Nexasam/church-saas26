<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Church;
use App\Models\Member;
use App\Models\Support;
use App\Models\HomeChurch;
use Illuminate\Database\Seeder;
use App\Models\ServiceAttendance;
use App\Models\HomeChurchAttendance;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // -----------------------------
        // 1. Create 3 Churches
        // -----------------------------
        $churchesData = [
            ['name' => 'Grace Life Church', 'address' => 'Lagos Mainland'],
            ['name' => 'Hope Revival Church', 'address' => 'Victoria Island'],
            ['name' => 'Faith Outreach Church', 'address' => 'Ikorodu'],
        ];

        $churches = collect();
        foreach ($churchesData as $data) {
            $church = Church::firstOrCreate(
                ['name' => $data['name']],
                [
                    'address' => $data['address'],
                    'has_branches' => 1,
                    'payment_category' => 'free',
                    'subscription_expiry' => now()->addYear(),
                ]
            );
            $churches->push($church);
        }

        // Create default admin/pastor users per church
        foreach ($churches as $church) {
            User::firstOrCreate(
                ['email' => strtolower(str_replace(' ', '_', $church->name)) . '@church.com'],
                [
                    'name' => $church->name . ' Admin',
                    'email' => strtolower(str_replace(' ', '_', $church->name)) . '@church.com',
                    'password' => Hash::make('password123'), // default
                    'church_id' => $church->id,
                    // 'role' => 'admin',
                ]
            );
        }

        // -----------------------------
        // 2. Create Home Churches for each Church
        // -----------------------------
        foreach ($churches as $church) {
            if ($church->homeChurches()->count() === 0) {
                $homeChurches = [
                    ['name' => 'Main Home Church', 'address' => 'Main Campus'],
                    ['name' => 'East Home Church', 'address' => 'East Campus'],
                    ['name' => 'West Home Church', 'address' => 'West Campus'],
                ];

                foreach ($homeChurches as $hc) {
                    HomeChurch::firstOrCreate([
                        'church_id' => $church->id,
                        'name' => $hc['name'],
                    ], [
                        'address' => $hc['address'],
                    ]);
                }
            }
        }

        // -----------------------------
        // 3. Seed Members and attach to churches
        // -----------------------------
        foreach ($churches as $church) {
            if ($church->members()->count() < 50) {
                $members = Member::factory()
                    ->count(50)
                    ->create();

                foreach ($members as $member) {
                    $member->churches()->attach($church->id, [
                        'membership_type' => 'full',
                        'is_active' => true,
                        'joined_at' => now(),
                    ]);
                }
            }
        }

        // -----------------------------
        // 4. Attach members to Home Churches
        // -----------------------------
        foreach ($churches as $church) {
            $homeChurches = $church->homeChurches;
            foreach ($homeChurches as $homeChurch) {
                $membersInChurch = $church->members;
                $membersToAttach = $membersInChurch->random(min(10, $membersInChurch->count()));

                foreach ($membersToAttach as $member) {
                    $homeChurch->members()->syncWithoutDetaching([
                        $member->id => [
                            'church_id' => $church->id,
                            'role' => null,
                            'is_active' => true,
                            'joined_at' => now(),
                        ]
                    ]);
                }
            }
        }

        // -----------------------------
        // 5. Seed Home Church Attendance for today
        // -----------------------------
        foreach ($churches as $church) {
            foreach ($church->homeChurches as $homeChurch) {
                foreach ($homeChurch->members as $member) {
                    HomeChurchAttendance::firstOrCreate([
                        'home_church_id' => $homeChurch->id,
                        'member_id' => $member->id,
                        'date' => now()->toDateString(),
                    ]);
                }
            }
        }

        // -----------------------------
        // 6. Seed demo Support
        // -----------------------------
        foreach ($churches as $church) {
            if ($church->supporters()->count() === 0) {
                Support::create([
                    'church_id' => $church->id,
                    'amount' => 50000,
                    'channel' => 'demo',
                    'status' => 'successful',
                ]);
            }
        }


          /**
         * 7. Seed Service Attendances for each Church (random)
         */
        $serviceNames = ['Sunday Service', 'Youth Service', 'Wednesday Service'];

        foreach ($churches as $church) {
            $members = Member::factory()
            ->count(50)
            ->create();

            foreach ($members as $member) {
                // Each member attends 0-3 services randomly
                foreach ($serviceNames as $serviceName) {
                    if (rand(0, 1)) {
                        ServiceAttendance::firstOrCreate([
                            'member_id' => $member->id,
                            'church_id' => $church->id,
                            'service_date' => now()->toDateString(),
                            'service_name' => $serviceName
                        ]);
                    }
                }
            }
        }


        $this->command->info('Database seeding completed for 3 churches!');
    }
}
