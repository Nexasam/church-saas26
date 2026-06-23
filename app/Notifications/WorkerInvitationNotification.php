<?php

namespace App\Notifications;

use App\Models\WorkerInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkerInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly WorkerInvitation $invitation
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $acceptUrl = route('worker.invitation.accept', ['token' => $this->invitation->token]);
        $departmentName = $this->invitation->department->name;
        $churchName = $this->invitation->church->name;
        $inviterName = $this->invitation->creator->name;
        $role = ucfirst($this->invitation->role);

        return (new MailMessage)
            ->subject("You've been invited to join {$departmentName} at {$churchName}")
            ->greeting("Hello {$this->invitation->name}!")
            ->line("{$inviterName} has invited you to join the {$departmentName} department as a **{$role}** at {$churchName} on Church OS.")
            ->line("As a {$role}, you'll be able to:")
            ->line($this->role === 'leader' 
                ? "- Manage department activities and members\n- View department reports and analytics\n- Coordinate team assignments"
                : "- View department activities\n- Participate in department tasks\n- Access department resources")
            ->line("This invitation will expire in 7 days.")
            ->action('Accept Invitation', $acceptUrl)
            ->line("If you did not expect this invitation, you can safely ignore this email.");
    }

    /**
     * The notifiable is the WorkerInvitation itself (via email address).
     * We route the notification to the invited email directly.
     */
    public function routeNotificationForMail(): string
    {
        return $this->invitation->email;
    }
}
