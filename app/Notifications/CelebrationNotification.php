<?php

namespace App\Notifications;

use App\Models\Celebration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CelebrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Celebration $celebration
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'celebration_id' => $this->celebration->id,
            'member_name' => $this->celebration->member_name,
            'category' => $this->celebration->category?->name,
            'date' => $this->celebration->date->toDateString(),
            'note' => $this->celebration->note,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $categoryName = $this->celebration->category?->name ?? 'Celebration';
        $url = route('love.index');

        return (new MailMessage)
            ->subject("{$categoryName}: {$this->celebration->member_name}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("We have a celebration to acknowledge:")
            ->line("**Member:** {$this->celebration->member_name}")
            ->line("**Category:** {$categoryName}")
            ->line("**Date:** {$this->celebration->date->toDateString()}")
            ->when($this->celebration->note, fn($mail) => $mail->line("**Note:** {$this->celebration->note}"))
            ->action('View Celebrations', $url)
            ->line("Let's celebrate together!");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'celebration_id' => $this->celebration->id,
            'member_name' => $this->celebration->member_name,
            'category' => $this->celebration->category?->name,
        ];
    }
}
