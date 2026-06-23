<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\Department;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a church and user for testing
        $this->church = Church::factory()->create();
        $this->user = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);
    }

    public function test_authenticated_users_can_view_members()
    {
        $this->actingAs($this->user);
        
        Member::factory()->create();
        $this->church->members()->attach(Member::first(), [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->get(route('members.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_members()
    {
        $response = $this->get(route('members.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_member()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('members.store'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'membership_type' => 'full',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
    }

    public function test_can_update_member()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->patch(route('members.update', $member), [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'membership_type' => 'visitor',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('members', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
    }

    public function test_can_toggle_member_status()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->patch(route('members.toggle-status', $member));
        $response->assertRedirect();

        $this->assertFalse(
            $member->churches()->where('churches.id', $this->church->id)->first()->pivot->is_active
        );
    }

    public function test_can_delete_member()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->delete(route('members.destroy', $member));
        $response->assertRedirect();

        $this->assertDatabaseMissing('church_member', [
            'church_id' => $this->church->id,
            'member_id' => $member->id,
        ]);
    }

    public function test_can_search_members()
    {
        $this->actingAs($this->user);

        $member1 = Member::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
        $member2 = Member::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

        $this->church->members()->attach([$member1->id, $member2->id], [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->get(route('members.index', ['search' => 'John']));
        $response->assertOk();
    }

    public function test_can_import_members_via_csv()
    {
        $this->actingAs($this->user);

        $csvContent = "first_name,last_name,email,phone\nJohn,Doe,john@example.com,1234567890\nJane,Smith,jane@example.com,0987654321";
        $file = tmpfile();
        fwrite($file, $csvContent);
        fseek($file, 0);

        $response = $this->post(route('members.import'), [
            'file' => new \Illuminate\Http\UploadedFile(
                stream_get_meta_data($file)['uri'],
                'members.csv',
                'text/csv',
                null,
                true
            ),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('members', ['first_name' => 'John']);
        $this->assertDatabaseHas('members', ['first_name' => 'Jane']);

        fclose($file);
    }

    public function test_can_export_members()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create();
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->get(route('members.export'));
        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv');
    }
}
