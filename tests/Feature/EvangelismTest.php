<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\Member;
use App\Models\ProspectiveMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvangelismTest extends TestCase
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

    public function test_authenticated_users_can_view_evangelism()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('evangelism.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_evangelism()
    {
        $response = $this->get(route('evangelism.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_prospective_member()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('evangelism.store'), [
            'name' => 'John Doe',
            'phone' => '1234567890',
            'email' => 'john@example.com',
            'source' => 'evangelism',
            'date_won' => now()->toDateString(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('prospective_members', [
            'name' => 'John Doe',
            'stage' => 'soul_won',
        ]);
    }

    public function test_can_update_prospective_member()
    {
        $this->actingAs($this->user);

        $prospect = ProspectiveMember::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('evangelism.update', $prospect), [
            'stage' => 'visited',
            'status' => 'contacted',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('prospective_members', [
            'id' => $prospect->id,
            'stage' => 'visited',
        ]);
    }

    public function test_can_convert_prospective_member()
    {
        $this->actingAs($this->user);

        $prospect = ProspectiveMember::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('evangelism.convert', $prospect), [
            'membership_type' => 'full',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('prospective_members', [
            'id' => $prospect->id,
            'status' => 'converted',
        ]);
        $this->assertDatabaseHas('members', [
            'first_name' => explode(' ', $prospect->name)[0],
        ]);
    }

    public function test_can_delete_prospective_member()
    {
        $this->actingAs($this->user);

        $prospect = ProspectiveMember::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('evangelism.destroy', $prospect));
        $response->assertRedirect();

        $this->assertDatabaseMissing('prospective_members', ['id' => $prospect->id]);
    }

    public function test_can_add_log_to_prospective_member()
    {
        $this->actingAs($this->user);

        $prospect = ProspectiveMember::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('evangelism.logs.store', $prospect), [
            'type' => 'call',
            'channel' => 'WhatsApp',
            'note' => 'Called and they are interested',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('prospective_member_logs', [
            'prospective_member_id' => $prospect->id,
            'type' => 'call',
        ]);
    }

    public function test_can_delete_log()
    {
        $this->actingAs($this->user);

        $prospect = ProspectiveMember::factory()->create(['church_id' => $this->church->id]);
        $log = \App\Models\ProspectiveMemberLog::factory()->create([
            'prospective_member_id' => $prospect->id,
        ]);

        $response = $this->delete(route('evangelism.logs.destroy', [$prospect, $log]));
        $response->assertOk();

        $this->assertDatabaseMissing('prospective_member_logs', ['id' => $log->id]);
    }
}
