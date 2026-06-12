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

    public function create(array $input): User
    {
        Validator::make($input, [
            'church_name' => ['required', 'string', 'max:255'],
            ...$this->profileRules(),
            'password'    => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Create the church using the name they gave on register
            $church = Church::create([
                'name'                => $input['church_name'],
                'address'             => '',
                'has_branches'        => false,
                'onboarding_complete' => false,
            ]);

            // Seed the 6 default roles for this church
            Role::seedForChurch($church->id);

            $superAdminRole = Role::withoutGlobalScopes()
                ->where('church_id', $church->id)
                ->where('slug', 'super_admin')
                ->first();

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
