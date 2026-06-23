<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\CareCase;
use App\Models\CareCaseNote;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CareTest extends TestCase
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

    public function test_authenticated_users_can_view_care()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('care.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_care()
    {
        $response = $this->get(route('care.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_create_care_case()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('care.store'), [
            'member_name' => 'John Doe',
            'type' => 'hospital',
            'title' => 'Hospitalized after surgery',
            'description' => 'Needs prayer and visitation',
            'priority' => 'high',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('care_cases', [
            'member_name' => 'John Doe',
            'type' => 'hospital',
        ]);
    }

    public function test_can_update_care_case()
    {
        $this->actingAs($this->user);

        $careCase = CareCase::factory()->create(['church_id' => $this->church->id]);

        $response = $this->patch(route('care.update', $careCase), [
            'status' => 'in_progress',
            'priority' => 'urgent',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('care_cases', [
            'id' => $careCase->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_can_delete_care_case()
    {
        $this->actingAs($this->user);

        $careCase = CareCase::factory()->create(['church_id' => $this->church->id]);

        $response = $this->delete(route('care.destroy', $careCase));
        $response->assertRedirect();

        $this->assertDatabaseMissing('care_cases', ['id' => $careCase->id]);
    }

    public function test_can_add_note_to_care_case()
    {
        $this->actingAs($this->user);

        $careCase = CareCase::factory()->create(['church_id' => $this->church->id]);

        $response = $this->post(route('care.notes.store', $careCase), [
            'note' => 'Visited today, patient is recovering well',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('care_case_notes', [
            'care_case_id' => $careCase->id,
            'note' => 'Visited today, patient is recovering well',
        ]);
    }
}
