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
    // Nigerian first names
    private array $firstNames = [
        'Emeka', 'Chidi', 'Kelechi', 'Ifeanyi', 'Obiora', 'Nnamdi', 'Chukwuemeka', 'Adaeze',
        'Ngozi', 'Chioma', 'Amaka', 'Nneka', 'Adaora', 'Ugochi', 'Oluchi', 'Ebere',
        'Tunde', 'Seun', 'Bola', 'Wale', 'Dele', 'Femi', 'Sola', 'Remi',
        'Yetunde', 'Bukola', 'Folake', 'Toyin', 'Funmi', 'Adunola', 'Kemi', 'Lola',
        'Ibrahim', 'Musa', 'Usman', 'Aisha', 'Fatima', 'Hauwa', 'Zainab', 'Bilkisu',
        'Chukwudi', 'Obinna', 'Ikenna', 'Uchenna', 'Chinonso', 'Kenechukwu', 'Chibuike', 'Nonso',
        'Taiwo', 'Kehinde', 'Yinka', 'Gbemi', 'Kunle', 'Tobi', 'Dayo', 'Bisi',
        'Grace', 'Faith', 'Blessing', 'Patience', 'Goodness', 'Mercy', 'Joy', 'Peace',
        'Daniel', 'David', 'Joshua', 'Samuel', 'Emmanuel', 'Michael', 'Peter', 'Paul',
        'Chiamaka', 'Chidinma', 'Chinyere', 'Nkechi', 'Uche', 'Ifeoma', 'Ogechi', 'Adaeze',
    ];

    // Nigerian last names
    private array $lastNames = [
        'Okafor', 'Nwosu', 'Eze', 'Obi', 'Nwachukwu', 'Igwe', 'Onuoha', 'Chukwu',
        'Adeyemi', 'Ogundimu', 'Afolabi', 'Adeleke', 'Akindele', 'Oladele', 'Fashola', 'Balogun',
        'Abubakar', 'Suleiman', 'Abdullahi', 'Yusuf', 'Murtala', 'Garba', 'Danjuma', 'Aliyu',
        'Onyekachi', 'Nwosu', 'Obiechina', 'Anyanwu', 'Onyekwere', 'Nwigwe', 'Okeke', 'Ezeh',
        'Olawale', 'Adebayo', 'Olatunji', 'Owolabi', 'Ogundipe', 'Adesanya', 'Abimbola', 'Okonkwo',
        'Taiwo', 'Badmus', 'Lawal', 'Salami', 'Adeniyi', 'Ayodele', 'Oyelaran', 'Agboola',
        'Nwofor', 'Ihejirika', 'Okpara', 'Obioma', 'Nwamba', 'Dibia', 'Okonkwo', 'Achebe',
        'Amaechi', 'Wike', 'Peterside', 'Briggs', 'Owei', 'Ibama', 'Opara', 'Okorie',
    ];

    // Nigerian phone numbers
    private array $phonePrefix = [
        '0801', '0802', '0803', '0805', '0806', '0807', '0808', '0809',
        '0810', '0811', '0812', '0813', '0814', '0815', '0816', '0817',
        '0901', '0902', '0903', '0904', '0905', '0906', '0907', '0908',
    ];

    public function run(): void
    {
        $church = Church::first();

        if (!$church) {
            $this->command->error('No church found. Please run DatabaseSeeder first.');
            return;
        }

        $departments = [
            ['name' => 'Ushering',          'description' => 'Greets and seats members during services',    'icon' => 'Users',         'color' => 'blue'],
            ['name' => 'Music Ministry',    'description' => 'Leads worship and music during services',     'icon' => 'Music',         'color' => 'purple'],
            ['name' => 'Choir',             'description' => 'Provides vocal ministry during services',     'icon' => 'Mic',           'color' => 'pink'],
            ['name' => 'Prayer Team',       'description' => 'Intercedes for the church and members',       'icon' => 'HeartHandshake','color' => 'green'],
            ['name' => 'Security',          'description' => 'Ensures safety and order during services',    'icon' => 'Shield',        'color' => 'orange'],
            ['name' => 'Technical',         'description' => 'Manages sound, lighting, and media',          'icon' => 'Monitor',       'color' => 'slate'],
            ['name' => 'Children Ministry', 'description' => 'Ministers to children during services',       'icon' => 'Baby',          'color' => 'yellow'],
            ['name' => 'Hospitality',       'description' => 'Welcomes guests and provides refreshments',   'icon' => 'Coffee',        'color' => 'rose'],
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

        $credentials = [];
        $usedEmails  = [];

        foreach ($createdDepts as $deptName => $department) {
            $this->command->info("Seeding {$deptName}...");

            // Leader
            [$member, $email] = $this->createMemberAndUser($church, $department, 'leader', $usedEmails);
            $department->update(['leader' => $member->first_name . ' ' . $member->last_name, 'leader_id' => $member->id]);
            $credentials[] = ['department' => $deptName, 'role' => 'Leader', 'name' => $member->first_name . ' ' . $member->last_name, 'email' => $email];
            $usedEmails[] = $email;

            // 3 Workers
            for ($i = 0; $i < 3; $i++) {
                [$member, $email] = $this->createMemberAndUser($church, $department, 'worker', $usedEmails);
                $credentials[] = ['department' => $deptName, 'role' => 'Worker', 'name' => $member->first_name . ' ' . $member->last_name, 'email' => $email];
                $usedEmails[] = $email;
            }

            // 5 regular members (no user account)
            for ($i = 0; $i < 5; $i++) {
                $this->createMemberOnly($church, $department, $usedEmails);
            }
        }

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('WORKER PORTAL LOGIN CREDENTIALS');
        $this->command->info('All passwords: password123');
        $this->command->info('========================================');
        foreach ($credentials as $c) {
            $this->command->info("{$c['department']} | {$c['role']} | {$c['name']} | {$c['email']}");
        }
        $this->command->info('========================================');
    }

    private function randomName(): array
    {
        return [
            $this->firstNames[array_rand($this->firstNames)],
            $this->lastNames[array_rand($this->lastNames)],
        ];
    }

    private function randomPhone(): string
    {
        $prefix = $this->phonePrefix[array_rand($this->phonePrefix)];
        return $prefix . rand(1000000, 9999999);
    }

    private function makeEmail(string $first, string $last, array $used): string
    {
        $base = strtolower(preg_replace('/[^a-z]/i', '', $first))
              . '.'
              . strtolower(preg_replace('/[^a-z]/i', '', $last))
              . '@grace.org';
        $email = $base;
        $n = 2;
        while (in_array($email, $used) || User::withoutGlobalScopes()->where('email', $email)->exists()) {
            $email = str_replace('@grace.org', $n . '@grace.org', $base);
            $n++;
        }
        return $email;
    }

    private function createMemberAndUser($church, $department, string $role, array $usedEmails): array
    {
        [$first, $last] = $this->randomName();
        $email = $this->makeEmail($first, $last, $usedEmails);

        $member = Member::firstOrCreate(
            ['email' => $email],
            [
                'first_name' => $first,
                'last_name'  => $last,
                'phone'      => $this->randomPhone(),
            ]
        );

        User::firstOrCreate(
            ['email' => $email],
            [
                'name'              => "{$first} {$last}",
                'email_verified_at' => now(),
                'password'          => Hash::make('password123'),
                'church_id'         => $church->id,
            ]
        );

        $church->members()->syncWithoutDetaching([$member->id]);
        $department->members()->syncWithoutDetaching([
            $member->id => ['role' => $role, 'is_active' => true, 'joined_at' => now()],
        ]);

        return [$member, $email];
    }

    private function createMemberOnly($church, $department, array $usedEmails): void
    {
        [$first, $last] = $this->randomName();

        $member = Member::create([
            'first_name' => $first,
            'last_name'  => $last,
            'phone'      => $this->randomPhone(),
        ]);

        $church->members()->syncWithoutDetaching([$member->id]);
        $department->members()->syncWithoutDetaching([
            $member->id => ['role' => 'worker', 'is_active' => true, 'joined_at' => now()],
        ]);
    }
}
