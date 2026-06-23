<?php

namespace App\Notifications;

use App\Models\SmsCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SmsDeliveryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly SmsCampaign $campaign
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'campaign_id' => $this->campaign->id,
            'title' => $this->campaign->title,
            'type' => $this->campaign->type,
            'recipients_count' => $this->campaign->recipients_count,
            'sent_count' => $this->campaign->sent_count,
            'failed_count' => $this->campaign->failed_count,
            'status' => $this->campaign->status,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'campaign_id' => $this->campaign->id,
            'title' => $this->campaign->title,
            'status' => $this->campaign->status,
        ];
    }
}
