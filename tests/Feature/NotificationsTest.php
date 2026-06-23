<?php

namespace Tests\Feature;

use App\Models\Church;
use App\Models\CareCase;
use App\Models\Celebration;
use App\Models\CelebrationCategory;
use App\Models\FollowUp;
use App\Models\FollowUpTask;
use App\Models\NotificationPreference;
use App\Models\SmsCampaign;
use App\Models\User;
use App\Notifications\CareCaseAssignedNotification;
use App\Notifications\CelebrationNotification;
use App\Notifications\FollowUpReminderNotification;
use App\Notifications\SmsDeliveryNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationsTest extends TestCase
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

    public function test_care_case_assignment_sends_notification()
    {
        Notification::fake();

        $assignedUser = User::factory()->create(['church_id' => $this->church->id]);
        $careCase = CareCase::factory()->create([
            'church_id' => $this->church->id,
            'assigned_to' => $assignedUser->id,
        ]);

        $assignedUser->notify(new CareCaseAssignedNotification($careCase));

        Notification::assertSentTo(
            $assignedUser,
            CareCaseAssignedNotification::class,
            function ($notification, $channels) use ($careCase) {
                return $notification->careCase->id === $careCase->id;
            }
        );
    }

    public function test_follow_up_reminder_sends_notification()
    {
        Notification::fake();

        $assignedUser = User::factory()->create(['church_id' => $this->church->id]);
        $followUp = FollowUp::factory()->create(['church_id' => $this->church->id]);
        $task = FollowUpTask::factory()->create([
            'church_id' => $this->church->id,
            'follow_up_id' => $followUp->id,
            'assigned_to' => $assignedUser->id,
        ]);

        $assignedUser->notify(new FollowUpReminderNotification($followUp, $task));

        Notification::assertSentTo(
            $assignedUser,
            FollowUpReminderNotification::class
        );
    }

    public function test_celebration_notification_sends_to_all_admins()
    {
        Notification::fake();

        $admin1 = User::factory()->create(['church_id' => $this->church->id]);
        $admin2 = User::factory()->create(['church_id' => $this->church->id]);
        
        $category = CelebrationCategory::factory()->create(['church_id' => $this->church->id]);
        $celebration = Celebration::factory()->create([
            'church_id' => $this->church->id,
            'category_id' => $category->id,
        ]);

        $admin1->notify(new CelebrationNotification($celebration));
        $admin2->notify(new CelebrationNotification($celebration));

        Notification::assertSentTo($admin1, CelebrationNotification::class);
        Notification::assertSentTo($admin2, CelebrationNotification::class);
    }

    public function test_sms_delivery_notification_sends()
    {
        Notification::fake();

        $campaign = SmsCampaign::factory()->create([
            'church_id' => $this->church->id,
            'sent_by' => $this->user->id,
        ]);

        $this->user->notify(new SmsDeliveryNotification($campaign));

        Notification::assertSentTo(
            $this->user,
            SmsDeliveryNotification::class
        );
    }

    public function test_can_fetch_notifications()
    {
        $this->actingAs($this->user);

        $response = $this->get(route('notifications.index'));
        $response->assertOk();
        $response->assertJsonStructure([
            'notifications',
            'unread_count',
        ]);
    }

    public function test_can_mark_notification_as_read()
    {
        $this->actingAs($this->user);

        $this->user->notify(new \Illuminate\Notifications\DatabaseNotification([
            'id' => 'test-id',
            'type' => 'test',
            'data' => [],
            'read_at' => null,
        ]));

        $response = $this->patch(route('notifications.read', 'test-id'));
        $response->assertOk();
    }

    public function test_can_mark_all_notifications_as_read()
    {
        $this->actingAs($this->user);

        $response = $this->post(route('notifications.read-all'));
        $response->assertOk();
    }

    public function test_can_delete_notification()
    {
        $this->actingAs($this->user);

        $notification = $this->user->notifications()->create([
            'id' => 'test-id',
            'type' => 'test',
            'data' => [],
        ]);

        $response = $this->delete(route('notifications.destroy', $notification->id));
        $response->assertOk();
    }

    public function test_can_fetch_notification_preferences()
    {
        $this->actingAs($this->user);

        NotificationPreference::forUser($this->user->id);

        $response = $this->get(route('notifications.preferences'));
        $response->assertOk();
        $response->assertJsonStructure([
            'email_care_cases',
            'email_follow_ups',
            'email_celebrations',
            'email_sms',
            'database_care_cases',
            'database_follow_ups',
            'database_celebrations',
            'database_sms',
        ]);
    }

    public function test_can_update_notification_preferences()
    {
        $this->actingAs($this->user);

        NotificationPreference::forUser($this->user->id);

        $response = $this->patch(route('notifications.update-preferences'), [
            'email_care_cases' => false,
            'email_follow_ups' => true,
        ]);

        $response->assertOk();
        
        $preferences = NotificationPreference::forUser($this->user->id);
        $this->assertFalse($preferences->email_care_cases);
        $this->assertTrue($preferences->email_follow_ups);
    }

    public function test_notification_preferences_helper_methods()
    {
        $preferences = NotificationPreference::forUser($this->user->id);

        $this->assertTrue($preferences->shouldReceiveEmail('care_cases'));
        $this->assertTrue($preferences->shouldReceiveDatabase('care_cases'));
    }
}
