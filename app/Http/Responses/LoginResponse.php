<?php

namespace App\Http\Responses;

use App\Models\Church;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user   = auth()->user();
        $church = Church::find($user->church_id);

        // If onboarding not done, send to wizard
        if (! $church?->onboarding_complete) {
            return redirect()->route('onboarding');
        }

        return redirect()->intended(config('fortify.home', '/dashboard'));
    }
}
