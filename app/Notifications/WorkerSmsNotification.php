<?php

namespace App\Notifications;

use App\Models\SmsCampaign;
use Illuminate\Notifications\Notification;

class WorkerSmsNotification extends Notification
{
    public function __construct(
        public readonly SmsCampaign $campaign,
        public readonly string $recipientLabel,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'            => 'worker_sms',
            'campaign_id'     => $this->campaign->id,
            'title'           => $this->campaign->title,
            'message'         => $this->campaign->message,
            'recipient_label' => $this->recipientLabel,
            'sent_at'         => $this->campaign->sent_at?->toIso8601String()
                                 ?? $this->campaign->created_at->toIso8601String(),
        ];
    }
}
