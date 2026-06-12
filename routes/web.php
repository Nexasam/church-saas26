<?php

use Illuminate\Support\Facades\Route;

// Root: show landing page (redirects to dashboard if already logged in)
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return inertia('welcome');
})->name('home');

// Google OAuth
Route::get('auth/google',          [\App\Http\Controllers\Auth\GoogleController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [\App\Http\Controllers\Auth\GoogleController::class, 'callback'])->name('auth.google.callback');

// Admin invitation acceptance (public — no auth required)
Route::get('admin/invitation/{token}',  [\App\Http\Controllers\AdminController::class, 'acceptInvitation'])->name('admin.invitation.accept');
Route::post('admin/invitation/{token}', [\App\Http\Controllers\AdminController::class, 'acceptInvitation'])->name('admin.invitation.accept.submit');

// Platform Super Admin (Church OS owner only)
Route::middleware(['auth', \App\Http\Middleware\EnsurePlatformAdmin::class])
    ->prefix('platform')
    ->name('platform.')
    ->group(function () {
        Route::get('/',                                     [\App\Http\Controllers\PlatformAdminController::class, 'index'])->name('dashboard');
        Route::get('/settings',                             [\App\Http\Controllers\PlatformAdminController::class, 'settings'])->name('settings');
        Route::patch('/settings/profile',                   [\App\Http\Controllers\PlatformAdminController::class, 'updateProfile'])->name('settings.profile');
        Route::patch('/settings/password',                  [\App\Http\Controllers\PlatformAdminController::class, 'updatePassword'])->name('settings.password');
        Route::patch('/settings/platform',                  [\App\Http\Controllers\PlatformAdminController::class, 'updatePlatformConfig'])->name('settings.platform');
        Route::patch('/settings/plans',                     [\App\Http\Controllers\PlatformAdminController::class, 'updatePlans'])->name('settings.plans');
        Route::patch('/settings/sms',                       [\App\Http\Controllers\PlatformAdminController::class, 'updateSmsConfig'])->name('settings.sms');
        Route::post('/settings/announcement',               [\App\Http\Controllers\PlatformAdminController::class, 'sendAnnouncement'])->name('settings.announcement');
        Route::patch('churches/{church}/plan',              [\App\Http\Controllers\PlatformAdminController::class, 'toggleChurchStatus'])->name('churches.plan');
        Route::patch('churches/{church}/theme',             [\App\Http\Controllers\PlatformAdminController::class, 'updateChurchTheme'])->name('churches.theme');
        Route::patch('churches/{church}/suspend',           [\App\Http\Controllers\PlatformAdminController::class, 'suspendChurch'])->name('churches.suspend');
        Route::patch('churches/{church}/reactivate',        [\App\Http\Controllers\PlatformAdminController::class, 'reactivateChurch'])->name('churches.reactivate');
        Route::delete('churches/{church}',                  [\App\Http\Controllers\PlatformAdminController::class, 'deleteChurch'])->name('churches.delete');
        Route::post('churches/{church}/impersonate',        [\App\Http\Controllers\PlatformAdminController::class, 'impersonate'])->name('churches.impersonate');
    });

// Stop impersonating — only needs auth, not platform admin (we're logged in as the church user)
Route::middleware(['auth'])
    ->post('platform/stop-impersonating', [\App\Http\Controllers\PlatformAdminController::class, 'stopImpersonating'])
    ->name('platform.stop-impersonating');

Route::middleware(['auth'])->group(function () {
    // Onboarding wizard (must be before dashboard and all protected routes)
    Route::get('onboarding',              [\App\Http\Controllers\OnboardingController::class, 'show'])->name('onboarding');
    Route::post('onboarding/church',      [\App\Http\Controllers\OnboardingController::class, 'saveChurch'])->name('onboarding.church');
    Route::post('onboarding/departments', [\App\Http\Controllers\OnboardingController::class, 'saveDepartments'])->name('onboarding.departments');
    Route::post('onboarding/theme',       [\App\Http\Controllers\OnboardingController::class, 'saveTheme'])->name('onboarding.theme');
    Route::post('onboarding/plan',        [\App\Http\Controllers\OnboardingController::class, 'completePlan'])->name('onboarding.plan');
    Route::post('onboarding/skip',        [\App\Http\Controllers\OnboardingController::class, 'skip'])->name('onboarding.skip');

    // Dashboard
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // CRM / Follow-ups
    Route::inertia('followups', 'followups')->name('followups.index');
    Route::inertia('followups/create', 'followups')->name('followups.create');

    // Evangelism
    Route::inertia('evangelism', 'evangelism')->name('evangelism.index');
    Route::inertia('evangelism/create', 'evangelism')->name('evangelism.create');

    // Finance
    Route::inertia('finance', 'finance')->name('finance.index');
    Route::inertia('finance/create', 'finance')->name('finance.create');
    Route::inertia('finance/service-entry', 'finance')->name('finance.service-entry');
    Route::inertia('finance/reconciliation', 'finance')->name('finance.reconciliation');

    // Members
    Route::inertia('members', 'members')->name('members.index');
    Route::inertia('members/create', 'members')->name('members.create');
    Route::inertia('members/{id}', 'members')->name('members.show');

    // Departments
    Route::inertia('departments', 'departments')->name('departments.index');

    // Care Cases
    Route::inertia('care', 'care')->name('care.index');
    Route::inertia('care/create', 'care')->name('care.create');

    // Love System
    Route::inertia('love', 'love')->name('love.index');

    // Attendance
    Route::inertia('attendance', 'attendance')->name('attendance.index');

    // SMS
    Route::inertia('sms', 'sms')->name('sms.index');

    // Admin management
    Route::get('admin', [\App\Http\Controllers\AdminController::class, 'index'])->name('admin.index');
    Route::post('admin/invite', [\App\Http\Controllers\AdminController::class, 'invite'])->name('admin.invite');
    Route::patch('admin/users/{user}/role', [\App\Http\Controllers\AdminController::class, 'updateRole'])->name('admin.users.role');
    Route::patch('admin/users/{user}/toggle-status', [\App\Http\Controllers\AdminController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    Route::delete('admin/invitations/{invitation}', [\App\Http\Controllers\AdminController::class, 'revokeInvitation'])->name('admin.invitations.revoke');

    // Roles
    Route::post('admin/roles', [\App\Http\Controllers\RoleController::class, 'store'])->name('admin.roles.store');
    Route::patch('admin/roles/{role}', [\App\Http\Controllers\RoleController::class, 'update'])->name('admin.roles.update');
    Route::delete('admin/roles/{role}', [\App\Http\Controllers\RoleController::class, 'destroy'])->name('admin.roles.destroy');

    // Billing
    Route::inertia('billing', 'billing')->name('billing.index');
});

require __DIR__.'/settings.php';
