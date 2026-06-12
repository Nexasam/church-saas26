<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    public function rules(): array
    {
        $user = $this->user();

        // Only the platform admin (Church OS owner) can change their email
        if ($user->is_platform_admin) {
            return $this->profileRules($user->id);
        }

        // Everyone else (church owners + invited admins) — name only
        return ['name' => $this->nameRules()];
    }
}
