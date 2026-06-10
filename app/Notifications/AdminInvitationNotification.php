<?php

namespace App\Notifications;

use App\Models\AdminInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification;

class AdminInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly AdminInvitation $invitation
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $acceptUrl = route('admin.invitation.accept', ['token' => $this->invitation->token]);
        $churchName = $this->invitation->church->name;
        $roleName   = $this->invitation->role?->name ?? 'Admin';
        $inviterName = $this->invitation->invitedBy->name;

        return (new MailMessage)
            ->subject("You've been invited to manage {$churchName} on Church OS")
            ->greeting("Hello" . ($this->invitation->name ? ", {$this->invitation->name}" : '') . "!")
            ->line("{$inviterName} has invited you to join {$churchName} as a **{$roleName}** on Church OS.")
            ->line("This invitation will expire in 7 days.")
            ->action('Accept Invitation', $acceptUrl)
            ->line("If you did not expect this invitation, you can safely ignore this email.");
    }

    /**
     * The notifiable is the AdminInvitation itself (via email address).
     * We route the notification to the invited email directly.
     */
    public function routeNotificationForMail(): string
    {
        return $this->invitation->email;
    }
}
