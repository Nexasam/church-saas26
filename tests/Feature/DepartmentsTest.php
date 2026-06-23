<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\Department;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentsTest extends TestCase
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

    public function test_authenticated_users_can_view_departments()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('departments.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_departments()
    {
        $response = $this->get(route('departments.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_department()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('departments.store'), [
            'name' => 'Music Ministry',
            'description' => 'Church music department',
            'icon' => 'Music',
            'color' => 'blue',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('departments', [
            'name' => 'Music Ministry',
            'church_id' => $this->church->id,
        ]);
    }

    public function test_can_update_department()
    {
        $this->actingAs($this->user);

        $department = Department::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('departments.update', $department), [
            'name' => 'Updated Department',
            'description' => 'Updated description',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Updated Department',
        ]);
    }

    public function test_can_delete_department()
    {
        $this->actingAs($this->user);

        $department = Department::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('departments.destroy', $department));
        $response->assertRedirect();

        $this->assertDatabaseMissing('departments', ['id' => $department->id]);
    }

    public function test_can_add_members_to_department()
    {
        $this->actingAs($this->user);

        $department = Department::factory()->create(['church_id' => $this->church->id]);
        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, ['membership_type' => 'full']);

        $response = $this->post(route('departments.members.add', $department), [
            'member_ids' => [$member->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('department_member', [
            'department_id' => $department->id,
            'member_id' => $member->id,
        ]);
    }

    public function test_can_remove_member_from_department()
    {
        $this->actingAs($this->user);

        $department = Department::factory()->create(['church_id' => $this->church->id]);
        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, ['membership_type' => 'full']);
        $department->members()->attach($member->id);

        $response = $this->delete(route('departments.members.remove', [$department, $member]));
        $response->assertRedirect();

        $this->assertDatabaseMissing('department_member', [
            'department_id' => $department->id,
            'member_id' => $member->id,
        ]);
    }
}
