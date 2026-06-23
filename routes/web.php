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
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Follow-ups
    Route::get('followups',                                         [\App\Http\Controllers\FollowUpController::class, 'index'])->name('followups.index');
    Route::post('followups',                                        [\App\Http\Controllers\FollowUpController::class, 'store'])->name('followups.store');
    Route::patch('followups/{followUp}',                            [\App\Http\Controllers\FollowUpController::class, 'update'])->name('followups.update');
    Route::delete('followups/{followUp}',                           [\App\Http\Controllers\FollowUpController::class, 'destroy'])->name('followups.destroy');
    Route::post('followups/tasks',                                  [\App\Http\Controllers\FollowUpController::class, 'storeTask'])->name('followups.tasks.store');
    Route::patch('followups/tasks/{task}',                          [\App\Http\Controllers\FollowUpController::class, 'updateTask'])->name('followups.tasks.update');
    Route::delete('followups/tasks/{task}',                         [\App\Http\Controllers\FollowUpController::class, 'destroyTask'])->name('followups.tasks.destroy');

    // Evangelism
    Route::get('evangelism',                                                     [\App\Http\Controllers\EvangelismController::class, 'index'])->name('evangelism.index');
    Route::post('evangelism',                                                    [\App\Http\Controllers\EvangelismController::class, 'store'])->name('evangelism.store');
    Route::patch('evangelism/{prospectiveMember}',                               [\App\Http\Controllers\EvangelismController::class, 'update'])->name('evangelism.update');
    Route::post('evangelism/{prospectiveMember}/convert',                        [\App\Http\Controllers\EvangelismController::class, 'convert'])->name('evangelism.convert');
    Route::delete('evangelism/{prospectiveMember}',                              [\App\Http\Controllers\EvangelismController::class, 'destroy'])->name('evangelism.destroy');
    Route::get('evangelism/{prospectiveMember}/logs',                            [\App\Http\Controllers\EvangelismController::class, 'logs'])->name('evangelism.logs');
    Route::post('evangelism/{prospectiveMember}/logs',                           [\App\Http\Controllers\EvangelismController::class, 'storeLog'])->name('evangelism.logs.store');
    Route::delete('evangelism/{prospectiveMember}/logs/{log}',                   [\App\Http\Controllers\EvangelismController::class, 'destroyLog'])->name('evangelism.logs.destroy');

    // Finance
    Route::get('finance',                                           [\App\Http\Controllers\FinanceController::class, 'index'])->name('finance.index');
    Route::post('finance/income',                                   [\App\Http\Controllers\FinanceController::class, 'storeIncome'])->name('finance.income.store');
    Route::post('finance/expense',                                  [\App\Http\Controllers\FinanceController::class, 'storeExpense'])->name('finance.expense.store');
    Route::post('finance/service-entry',                            [\App\Http\Controllers\FinanceController::class, 'storeServiceOffering'])->name('finance.service.store');
    Route::patch('finance/service-entry/{serviceIncome}/reconcile', [\App\Http\Controllers\FinanceController::class, 'reconcileOffering'])->name('finance.service.reconcile');
    Route::delete('finance/income/{income}',                        [\App\Http\Controllers\FinanceController::class, 'destroyIncome'])->name('finance.income.destroy');
    Route::delete('finance/expense/{expense}',                      [\App\Http\Controllers\FinanceController::class, 'destroyExpense'])->name('finance.expense.destroy');
    Route::get('finance/export',                                    [\App\Http\Controllers\FinanceController::class, 'export'])->name('finance.export');

    // Members
    Route::get('members',                [\App\Http\Controllers\MemberController::class, 'index'])->name('members.index');
    Route::post('members',               [\App\Http\Controllers\MemberController::class, 'store'])->name('members.store');
    Route::patch('members/{member}',     [\App\Http\Controllers\MemberController::class, 'update'])->name('members.update');
    Route::patch('members/{member}/toggle-status', [\App\Http\Controllers\MemberController::class, 'toggleStatus'])->name('members.toggle-status');
    Route::delete('members/{member}',    [\App\Http\Controllers\MemberController::class, 'destroy'])->name('members.destroy');
    Route::post('members/import',        [\App\Http\Controllers\MemberController::class, 'import'])->name('members.import');
    Route::get('members/export',         [\App\Http\Controllers\MemberController::class, 'export'])->name('members.export');

    // Departments
    Route::get('departments',                                       [\App\Http\Controllers\DepartmentController::class, 'index'])->name('departments.index');
    Route::post('departments',                                      [\App\Http\Controllers\DepartmentController::class, 'store'])->name('departments.store');
    Route::patch('departments/{id}',                                [\App\Http\Controllers\DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('departments/{id}',                               [\App\Http\Controllers\DepartmentController::class, 'destroy'])->name('departments.destroy');
    Route::get('departments/{department}/members',                  [\App\Http\Controllers\DepartmentController::class, 'members'])->name('departments.members');
    Route::post('departments/{id}/members',                         [\App\Http\Controllers\DepartmentController::class, 'addMembers'])->name('departments.members.add');
    Route::delete('departments/{departmentId}/members/{memberId}',  [\App\Http\Controllers\DepartmentController::class, 'removeMember'])->name('departments.members.remove');

    // Care Cases
    Route::get('care',                                              [\App\Http\Controllers\CareController::class, 'index'])->name('care.index');
    Route::post('care',                                             [\App\Http\Controllers\CareController::class, 'store'])->name('care.store');
    Route::patch('care/{careCase}',                                 [\App\Http\Controllers\CareController::class, 'update'])->name('care.update');
    Route::delete('care/{careCase}',                                [\App\Http\Controllers\CareController::class, 'destroy'])->name('care.destroy');
    Route::post('care/{careCase}/notes',                            [\App\Http\Controllers\CareController::class, 'storeNote'])->name('care.notes.store');

    // Love System
    Route::get('love',                                              [\App\Http\Controllers\LoveController::class, 'index'])->name('love.index');
    Route::post('love/care',                                        [\App\Http\Controllers\LoveController::class, 'storeCareCase'])->name('love.care.store');
    Route::patch('love/care/{careCase}',                            [\App\Http\Controllers\LoveController::class, 'updateCareCase'])->name('love.care.update');
    Route::post('love/care/{careCase}/notes',                       [\App\Http\Controllers\LoveController::class, 'addCareNote'])->name('love.care.notes');
    Route::post('love/celebrations',                                [\App\Http\Controllers\LoveController::class, 'storeCelebration'])->name('love.celebrations.store');
    Route::patch('love/celebrations/{celebration}/acknowledge',     [\App\Http\Controllers\LoveController::class, 'acknowledgeCelebration'])->name('love.celebrations.acknowledge');
    Route::delete('love/celebrations/{celebration}',                [\App\Http\Controllers\LoveController::class, 'destroyCelebration'])->name('love.celebrations.destroy');
    Route::post('love/categories',                                  [\App\Http\Controllers\LoveController::class, 'storeCategory'])->name('love.categories.store');
    Route::delete('love/categories/{category}',                     [\App\Http\Controllers\LoveController::class, 'destroyCategory'])->name('love.categories.destroy');
    Route::post('love/prayers',                                     [\App\Http\Controllers\LoveController::class, 'storePrayer'])->name('love.prayers.store');
    Route::patch('love/prayers/{prayer}/resolve',                   [\App\Http\Controllers\LoveController::class, 'resolvePrayer'])->name('love.prayers.resolve');
    Route::delete('love/prayers/{prayer}',                          [\App\Http\Controllers\LoveController::class, 'destroyPrayer'])->name('love.prayers.destroy');

    // Attendance
    Route::get('attendance',            [\App\Http\Controllers\AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance/mark',      [\App\Http\Controllers\AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('attendance/bulk-mark', [\App\Http\Controllers\AttendanceController::class, 'bulkMark'])->name('attendance.bulk-mark');
    Route::get('attendance/export',     [\App\Http\Controllers\AttendanceController::class, 'export'])->name('attendance.export');

    // SMS
    Route::get('sms',                                               [\App\Http\Controllers\SmsController::class, 'index'])->name('sms.index');
    Route::post('sms/bulk',                                         [\App\Http\Controllers\SmsController::class, 'sendBulk'])->name('sms.bulk');
    Route::post('sms/individual',                                   [\App\Http\Controllers\SmsController::class, 'sendIndividual'])->name('sms.individual');

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
    Route::get('billing', [\App\Http\Controllers\BillingController::class, 'index'])->name('billing.index');
    Route::post('billing/plan', [\App\Http\Controllers\BillingController::class, 'updatePlan'])->name('billing.update-plan');
    Route::get('billing/invoice/{invoiceId}', [\App\Http\Controllers\BillingController::class, 'invoice'])->name('billing.invoice');

    // Notifications
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('notifications/preferences', [\App\Http\Controllers\NotificationController::class, 'preferences'])->name('notifications.preferences');
    Route::patch('notifications/preferences', [\App\Http\Controllers\NotificationController::class, 'updatePreferences'])->name('notifications.update-preferences');

    // Worker Portal
    Route::post('workers/invite', [\App\Http\Controllers\WorkerController::class, 'invite'])->name('workers.invite');
    Route::get('worker/dashboard', [\App\Http\Controllers\WorkerController::class, 'dashboard'])->name('worker.dashboard');
    Route::get('worker/department/{department}', [\App\Http\Controllers\WorkerController::class, 'department'])->name('worker.department');
    Route::patch('worker/department/{department}/member/{member}', [\App\Http\Controllers\WorkerController::class, 'updateMemberRole'])->name('worker.member.update');
    Route::delete('worker/department/{department}/member/{member}', [\App\Http\Controllers\WorkerController::class, 'removeMember'])->name('worker.member.remove');
});

require __DIR__.'/settings.php';
