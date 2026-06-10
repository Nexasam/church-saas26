<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Church;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect to Google OAuth.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Google sign-in failed. Please try again.',
            ]);
        }

        // Find or create user
        $user = User::withoutGlobalScopes()->firstOrCreate(
            ['email' => $googleUser->getEmail()],
            function () use ($googleUser) {
                $church = $this->getDefaultChurch();

                // Seed roles for new church
                \App\Models\Role::seedForChurch($church->id);

                $superAdminRole = \App\Models\Role::withoutGlobalScopes()
                    ->where('church_id', $church->id)
                    ->where('slug', 'super_admin')
                    ->first();

                return [
                    'name'              => $googleUser->getName(),
                    'email_verified_at' => now(),
                    'password'          => bcrypt(Str::random(24)),
                    'church_id'         => $church->id,
                    'role_id'           => $superAdminRole?->id,
                    'is_super_admin'    => true,
                    'status'            => 'active',
                ];
            }
        );

        Auth::login($user, remember: true);

        // Track last login
        $user->update(['last_login_at' => now()]);

        return redirect()->intended(config('fortify.home', '/dashboard'));
    }

    /**
     * Get or create a default church for Google sign-ups.
     */
    private function getDefaultChurch(): Church
    {
        return Church::firstOrCreate(
            ['name' => 'My Church'],
            ['address' => '', 'has_branches' => false],
        );
    }
}
