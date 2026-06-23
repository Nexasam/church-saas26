<?php

namespace App\Notifications;

use App\Models\FollowUp;
use App\Models\FollowUpTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FollowUpReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly FollowUp $followUp,
        public readonly ?FollowUpTask $task = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'follow_up_id' => $this->followUp->id,
            'name' => $this->followUp->name,
            'stage' => $this->followUp->stage,
            'priority' => $this->followUp->priority,
            'task_id' => $this->task?->id,
            'task_type' => $this->task?->type,
            'task_due_date' => $this->task?->due_date?->toDateString(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('followups.index');

        if ($this->task) {
            $subject = "Follow-up Task Due: {$this->followUp->name}";
            $message = "You have a follow-up task due for {$this->followUp->name}:";
            $details = "**Task:** {$this->task->type}\n**Due Date:** {$this->task->due_date?->toDateString()}\n**Priority:** {$this->task->priority}";
        } else {
            $subject = "Follow-up Reminder: {$this->followUp->name}";
            $message = "You have a follow-up pending for {$this->followUp->name}:";
            $details = "**Stage:** {$this->followUp->stage}\n**Priority:** {$this->followUp->priority}\n**Last Contact:** " . ($this->followUp->last_contact_at?->toDateString() ?? 'Never');
        }

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line($message)
            ->line($details)
            ->line("**Notes:** " . ($this->followUp->notes ?? 'No notes'))
            ->action('View Follow-up', $url)
            ->line("Please take appropriate action.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'follow_up_id' => $this->followUp->id,
            'name' => $this->followUp->name,
            'stage' => $this->followUp->stage,
        ];
    }
}
