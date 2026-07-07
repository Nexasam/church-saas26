<?php

namespace App\Notifications;

use App\Models\SmsCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SmsDeliveryNotification extends Notification
{
    use Queueable;

    public function __construct(public SmsCampaign $campaign)
    {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'        => 'sms_delivery',
            'campaign_id' => $this->campaign->id,
            'title'       => $this->campaign->title,
            'sent_count'  => $this->campaign->sent_count,
            'failed_count'=> $this->campaign->failed_count,
            'status'      => $this->campaign->status,
            'message'     => "SMS campaign \"{$this->campaign->title}\" delivered to {$this->campaign->sent_count} recipients.",
        ];
    }
}
