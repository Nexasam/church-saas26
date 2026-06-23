<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\FollowUp;
use App\Models\FollowUpTask;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowUpsTest extends TestCase
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

    public function test_authenticated_users_can_view_followups()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('followups.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_followups()
    {
        $response = $this->get(route('followups.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_followup()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('followups.store'), [
            'name' => 'John Doe',
            'phone' => '1234567890',
            'stage' => 'visitor',
            'priority' => 'medium',
            'source' => 'Sunday Service',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('follow_ups', [
            'name' => 'John Doe',
            'stage' => 'visitor',
        ]);
    }

    public function test_can_update_followup()
    {
        $this->actingAs($this->user);

        $followUp = FollowUp::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('followups.update', $followUp), [
            'stage' => 'first_contact',
            'priority' => 'high',
            'notes' => 'Updated notes',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('follow_ups', [
            'id' => $followUp->id,
            'stage' => 'first_contact',
        ]);
    }

    public function test_can_delete_followup()
    {
        $this->actingAs($this->user);

        $followUp = FollowUp::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('followups.destroy', $followUp));
        $response->assertRedirect();

        $this->assertDatabaseMissing('follow_ups', ['id' => $followUp->id]);
    }

    public function test_can_create_followup_task()
    {
        $this->actingAs($this->user);

        $followUp = FollowUp::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('followups.tasks.store'), [
            'follow_up_id' => $followUp->id,
            'type' => 'call',
            'priority' => 'high',
            'due_date' => now()->addWeek()->toDateString(),
            'notes' => 'Follow up call',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('follow_up_tasks', [
            'follow_up_id' => $followUp->id,
            'type' => 'call',
        ]);
    }

    public function test_can_update_followup_task()
    {
        $this->actingAs($this->user);

        $task = FollowUpTask::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('followups.tasks.update', $task), [
            'status' => 'done',
            'priority' => 'low',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('follow_up_tasks', [
            'id' => $task->id,
            'status' => 'done',
        ]);
    }

    public function test_can_delete_followup_task()
    {
        $this->actingAs($this->user);

        $task = FollowUpTask::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('followups.tasks.destroy', $task));
        $response->assertRedirect();

        $this->assertDatabaseMissing('follow_up_tasks', ['id' => $task->id]);
    }
}
