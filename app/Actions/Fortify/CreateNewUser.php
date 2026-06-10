<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Church;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Find or create a church
            $church = Church::firstOrCreate(
                ['name' => $input['church_name'] ?? 'My Church'],
                ['address' => '', 'has_branches' => false]
            );

            // Seed default roles for this church if they don't exist yet
            Role::seedForChurch($church->id);

            // Get the super_admin role
            $superAdminRole = Role::withoutGlobalScopes()
                ->where('church_id', $church->id)
                ->where('slug', 'super_admin')
                ->first();

            // The registering user becomes the church's super admin
            return User::create([
                'name'              => $input['name'],
                'email'             => $input['email'],
                'password'          => $input['password'],
                'church_id'         => $church->id,
                'role_id'           => $superAdminRole?->id,
                'is_super_admin'    => true,
                'status'            => 'active',
                'email_verified_at' => now(),
            ]);
        });
    }
}
