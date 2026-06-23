<?php

namespace Tests\Feature;

use App\Models\AdminInvitation;
use App\Models\Church;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->church = Church::factory()->create();
        $this->user = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);
    }

    public function test_authenticated_users_can_view_admin()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('admin.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_admin()
    {
        $response = $this->get(route('admin.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_invite_admin()
    {
        $this->actingAs($this->user);

        $role = Role::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('admin.invite'), [
            'email' => 'newadmin@example.com',
            'name' => 'New Admin',
            'role_id' => $role->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('admin_invitations', [
            'email' => 'newadmin@example.com',
            'church_id' => $this->church->id,
        ]);
    }

    public function test_cannot_invite_existing_user()
    {
        $this->actingAs($this->user);

        $existingUser = User::factory()->create(['church_id' => $this->church->id]);
        $role = Role::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('admin.invite'), [
            'email' => $existingUser->email,
            'name' => 'Duplicate',
            'role_id' => $role->id,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_can_update_user_role()
    {
        $this->actingAs($this->user);

        $targetUser = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => false,
        ]);
        $newRole = Role::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('admin.users.role', $targetUser), [
            'role_id' => $newRole->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'role_id' => $newRole->id,
        ]);
    }

    public function test_cannot_change_super_admin_role()
    {
        $this->actingAs($this->user);

        $superAdmin = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);
        $newRole = Role::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('admin.users.role', $superAdmin), [
            'role_id' => $newRole->id,
        ]);

        $response->assertSessionHasErrors('role_id');
    }

    public function test_can_toggle_user_status()
    {
        $this->actingAs($this->user);

        $targetUser = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => false,
            'status' => 'active',
        ]);

        $response = $this->patch(route('admin.users.toggle-status', $targetUser));
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'status' => 'suspended',
        ]);
    }

    public function test_cannot_suspend_super_admin()
    {
        $this->actingAs($this->user);

        $superAdmin = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);

        $response = $this->patch(route('admin.users.toggle-status', $superAdmin));
        $response->assertSessionHasErrors('status');
    }

    public function test_can_revoke_invitation()
    {
        $this->actingAs($this->user);

        $invitation = AdminInvitation::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('admin.invitations.revoke', $invitation));
        $response->assertRedirect();

        $this->assertDatabaseMissing('admin_invitations', ['id' => $invitation->id]);
    }

    public function test_can_create_custom_role()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('admin.roles.store'), [
            'name' => 'Custom Role',
            'permissions' => [
                'members' => ['view', 'create'],
                'finance' => ['view'],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'name' => 'Custom Role',
            'slug' => 'custom_role',
            'church_id' => $this->church->id,
        ]);
    }

    public function test_can_update_custom_role()
    {
        $this->actingAs($this->user);

        $role = Role::factory()->create([
            'church_id' => $this->church->id,
            'is_system' => false,
        ]);

        $response = $this->patch(route('admin.roles.update', $role), [
            'name' => 'Updated Role',
            'permissions' => [
                'members' => ['view', 'create', 'edit'],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'Updated Role',
        ]);
    }

    public function test_cannot_modify_system_role()
    {
        $this->actingAs($this->user);

        $systemRole = Role::factory()->create([
            'church_id' => $this->church->id,
            'is_system' => true,
        ]);

        $response = $this->patch(route('admin.roles.update', $systemRole), [
            'name' => 'Modified System Role',
            'permissions' => [],
        ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_can_delete_custom_role()
    {
        $this->actingAs($this->user);

        $role = Role::factory()->create([
            'church_id' => $this->church->id,
            'is_system' => false,
        ]);

        $response = $this->delete(route('admin.roles.destroy', $role));
        $response->assertRedirect();

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_cannot_delete_system_role()
    {
        $this->actingAs($this->user);

        $systemRole = Role::factory()->create([
            'church_id' => $this->church->id,
            'is_system' => true,
        ]);

        $response = $this->delete(route('admin.roles.destroy', $systemRole));
        $response->assertSessionHasErrors('role');
    }
}
