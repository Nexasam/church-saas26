<?php

namespace App\Notifications;

use App\Models\CareCase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CareCaseAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly CareCase $careCase
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'care_case_id' => $this->careCase->id,
            'member_name' => $this->careCase->member_name,
            'type' => $this->careCase->type,
            'title' => $this->careCase->title,
            'priority' => $this->careCase->priority,
            'assigned_by' => auth()->user()?->name ?? 'System',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('care.index');

        return (new MailMessage)
            ->subject("New Care Case Assigned: {$this->careCase->member_name}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("You have been assigned a new care case:")
            ->line("**Member:** {$this->careCase->member_name}")
            ->line("**Type:** {$this->careCase->type}")
            ->line("**Title:** {$this->careCase->title}")
            ->line("**Priority:** {$this->careCase->priority}")
            ->line("**Description:** " . ($this->careCase->description ?? 'No description provided'))
            ->action('View Care Case', $url)
            ->line("Please review and take appropriate action.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'care_case_id' => $this->careCase->id,
            'member_name' => $this->careCase->member_name,
            'type' => $this->careCase->type,
            'title' => $this->careCase->title,
        ];
    }
}
