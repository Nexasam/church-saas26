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

Route::middleware(['auth'])->group(function () {
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
