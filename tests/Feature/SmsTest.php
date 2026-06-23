<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\Member;
use App\Models\SmsCampaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->church = Church::factory()->create(['payment_category' => 'growth']);
        $this->user = User::factory()->create([
            'church_id' => $this->church->id,
            'is_super_admin' => true,
        ]);
    }

    public function test_authenticated_users_can_view_sms()
    {
        $this->actingAs($this->user);
        
        $response = $this->get(route('sms.index'));
        $response->assertOk();
    }

    public function test_guests_cannot_view_sms()
    {
        $response = $this->get(route('sms.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_can_send_bulk_sms()
    {
        $this->actingAs($this->user);

        // Create members with phone numbers
        $member1 = Member::factory()->create(['phone' => '1234567890']);
        $member2 = Member::factory()->create(['phone' => '0987654321']);
        $this->church->members()->attach([$member1->id, $member2->id], [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->post(route('sms.bulk'), [
            'title' => 'Sunday Service Reminder',
            'message' => 'Join us this Sunday at 10 AM',
            'recipient_group' => 'active',
            'recipients_count' => 2,
            'sms_units' => 2,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sms_campaigns', [
            'title' => 'Sunday Service Reminder',
            'type' => 'bulk',
        ]);
    }

    public function test_can_send_individual_sms()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create(['phone' => '1234567890']);
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->post(route('sms.individual'), [
            'member_id' => $member->id,
            'message' => 'Hello from church',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sms_campaigns', [
            'type' => 'individual',
            'recipient_phone' => '1234567890',
        ]);
    }

    public function test_cannot_send_sms_without_phone_number()
    {
        $this->actingAs($this->user);

        $member = Member::factory()->create(['phone' => null]);
        $this->church->members()->attach($member->id, [
            'membership_type' => 'full',
            'is_active' => true,
        ]);

        $response = $this->post(route('sms.individual'), [
            'member_id' => $member->id,
            'message' => 'Hello',
        ]);

        $response->assertSessionHasErrors('phone');
    }

    public function test_sms_quota_is_enforced()
    {
        $this->actingAs($this->user);

        // Set church to free plan with 50 SMS limit
        $this->church->update(['payment_category' => 'free']);

        // Create SMS usage to reach limit
        SmsCampaign::factory()->create([
            'church_id' => $this->church->id,
            'sms_units_used' => 50,
            'created_at' => now(),
        ]);

        $response = $this->post(route('sms.bulk'), [
            'title' => 'Test',
            'message' => 'Test message',
            'recipient_group' => 'active',
            'recipients_count' => 1,
            'sms_units' => 1,
        ]);

        $response->assertSessionHasErrors('quota');
    }
}
