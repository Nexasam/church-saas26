<?php

namespace App\Notifications;

use App\Models\SmsCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WorkerSmsNotification extends Notification
{
    use Queueable;

    public function __construct(
        public SmsCampaign $campaign,
        public string $label
    ) {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'        => 'worker_sms',
            'campaign_id' => $this->campaign->id,
            'title'       => $this->label,
            'message'     => $this->campaign->message,
            'sent_to'     => $this->campaign->recipient_group,
            'sent_count'  => $this->campaign->sent_count,
        ];
    }
}
