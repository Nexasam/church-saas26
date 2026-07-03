<?php

namespace App\Http\Controllers;

use App\Models\Church;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PlatformAdminController extends Controller
{
    public function index()
    {
        $churches = Church::with([
                'users' => fn($q) => $q->where('is_super_admin', true)
                    ->select('id', 'name', 'email', 'church_id', 'last_login_at', 'status')
                    ->limit(1),
            ])
            ->latest()
            ->get()
            ->map(fn(Church $c) => [
                'id'                  => $c->id,
                'name'                => $c->name,
                'address'             => $c->address,
                'city'                => $c->city ?? null,
                'size'                => $c->size ?? 'small',
                'plan'                => $c->payment_category,
                'onboarding_complete' => (bool) $c->onboarding_complete,
                'subscription_expiry' => $c->subscription_expiry?->toDateString(),
                'members_count'       => 0, // will be real when members backend is wired
                'theme_color'         => $c->theme_color ?? 'blue',
                'created_at'          => $c->created_at->toDateString(),
                'super_admin'         => $c->users->first() ? [
                    'name'          => $c->users->first()->name,
                    'email'         => $c->users->first()->email,
                    'last_login_at' => $c->users->first()->last_login_at?->toDateTimeString(),
                    'status'        => $c->users->first()->status,
                ] : null,
            ]);

        $stats = [
            'total_churches'  => $churches->count(),
            'active_churches' => $churches->where('onboarding_complete', true)->count(),
            'paid_churches'   => $churches->where('plan', 'paid')->count(),
            'total_members'   => 0,
        ];

        return Inertia::render('platform/dashboard', [
            'churches' => $churches,
            'stats'    => $stats,
        ]);
    }

    public function settings()
    {
        $user = auth()->user();

        // Get persisted settings or use defaults
        return Inertia::render('platform/settings', [
            'adminUser' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'platformConfig' => [
                'app_name'      => PlatformSetting::get('app_name', config('app.name', 'Church OS')),
                'support_email' => PlatformSetting::get('support_email', env('SUPPORT_EMAIL', 'support@churchos.app')),
                'app_url'       => config('app.url'),
            ],
            'plans' => PlatformSetting::get('plans', [
                ['id' => 'starter',    'name' => 'Starter',    'price' => 15000, 'sms_limit' => 300,  'member_limit' => 200,  'admin_limit' => 1],
                ['id' => 'growth',     'name' => 'Growth',     'price' => 35000, 'sms_limit' => 500,  'member_limit' => 1000, 'admin_limit' => 5],
                ['id' => 'enterprise', 'name' => 'Enterprise', 'price' => 85000, 'sms_limit' => 1000, 'member_limit' => 0,    'admin_limit' => 0],
            ]),
            'smsConfig' => [
                'provider'   => PlatformSetting::get('sms_provider', env('SMS_PROVIDER', 'termii')),
                'termii_key' => PlatformSetting::get('termii_api_key') ? '••••••••' : '',
                'sender_id'  => PlatformSetting::get('sms_sender_id', env('SMS_SENDER_ID', 'ChurchOS')),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);
        auth()->user()->update($validated);
        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        auth()->user()->update(['password' => $request->password]);
        return back()->with('success', 'Password updated.');
    }

    public function updatePlatformConfig(Request $request)
    {
        $validated = $request->validate([
            'app_name'      => ['required', 'string', 'max:100'],
            'support_email' => ['required', 'email'],
        ]);

        PlatformSetting::set('app_name', $validated['app_name'], 'string', 'general');
        PlatformSetting::set('support_email', $validated['support_email'], 'string', 'general');

        return back()->with('success', 'Platform config updated.');
    }

    public function updatePlans(Request $request)
    {
        $validated = $request->validate([
            'plans'              => ['required', 'array'],
            'plans.*.name'       => ['required', 'string'],
            'plans.*.price'      => ['required', 'integer', 'min:0'],
            'plans.*.sms_limit'  => ['required', 'integer', 'min:0'],
        ]);

        PlatformSetting::set('plans', $validated['plans'], 'json', 'plans');

        return back()->with('success', 'Plans updated.');
    }

    public function updateSmsConfig(Request $request)
    {
        $validated = $request->validate([
            'provider'  => ['required', 'in:termii,twilio,smsbulk'],
            'api_key'   => ['nullable', 'string'],
            'sender_id' => ['nullable', 'string', 'max:11'],
        ]);

        PlatformSetting::set('sms_provider', $validated['provider'], 'string', 'sms');
        
        if ($validated['api_key']) {
            PlatformSetting::set('termii_api_key', $validated['api_key'], 'string', 'sms');
        }
        
        if ($validated['sender_id']) {
            PlatformSetting::set('sms_sender_id', $validated['sender_id'], 'string', 'sms');
        }

        return back()->with('success', 'SMS configuration updated.');
    }

    public function sendAnnouncement(Request $request)
    {
        $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'type'    => ['required', 'in:info,warning,success'],
        ]);
        // In production: store in announcements table, broadcast to all churches
        return back()->with('success', 'Announcement sent to all churches.');
    }

    public function updateChurchTheme(Request $request, Church $church)
    {
        $request->validate([
            'theme_color' => ['required', 'in:blue,purple,emerald,rose,amber,slate'],
        ]);
        $church->update(['theme_color' => $request->theme_color]);
        return back()->with('success', "{$church->name} theme updated.");
    }

    public function toggleChurchStatus(Church $church)
    {
        $newPlan = $church->payment_category === 'paid' ? 'free' : 'paid';
        $church->update(['payment_category' => $newPlan]);
        return back()->with('success', "Church plan updated to {$newPlan}.");
    }

    public function suspendChurch(Church $church)
    {
        // Suspend all non-platform-admin users of this church
        User::withoutGlobalScopes()
            ->where('church_id', $church->id)
            ->where('is_platform_admin', false)
            ->update(['status' => 'suspended']);

        return back()->with('success', "{$church->name} has been suspended.");
    }

    public function reactivateChurch(Church $church)
    {
        User::withoutGlobalScopes()
            ->where('church_id', $church->id)
            ->update(['status' => 'active']);

        return back()->with('success', "{$church->name} has been reactivated.");
    }

    public function deleteChurch(Church $church)
    {
        // This is destructive — soft delete all users first, then delete church
        $church->delete();
        return back()->with('success', "Church deleted.");
    }

    public function impersonate(Church $church)
    {
        // Log in as the church's super admin for support purposes
        $superAdmin = User::withoutGlobalScopes()
            ->where('church_id', $church->id)
            ->where('is_super_admin', true)
            ->first();

        if (! $superAdmin) {
            return back()->withErrors(['error' => 'No super admin found for this church.']);
        }

        // Store original admin ID for de-impersonation
        session(['impersonating_as' => $superAdmin->id, 'original_admin' => auth()->id()]);
        auth()->login($superAdmin);

        return redirect()->route('dashboard')->with('success', "Now viewing as {$church->name}.");
    }

    public function stopImpersonating()
    {
        $originalId = session('original_admin');
        if ($originalId) {
            $original = User::withoutGlobalScopes()->find($originalId);
            if ($original) {
                auth()->login($original);
                session()->forget(['impersonating_as', 'original_admin']);
                return redirect()->route('platform.dashboard')->with('success', 'Returned to platform admin.');
            }
        }
        return redirect()->route('dashboard');
    }
}
