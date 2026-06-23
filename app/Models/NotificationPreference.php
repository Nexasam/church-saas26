<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $guarded = [];

    protected $casts = [
        'email_care_cases' => 'boolean',
        'email_follow_ups' => 'boolean',
        'email_celebrations' => 'boolean',
        'email_sms' => 'boolean',
        'database_care_cases' => 'boolean',
        'database_follow_ups' => 'boolean',
        'database_celebrations' => 'boolean',
        'database_sms' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create preferences for a user.
     */
    public static function forUser(int $userId): self
    {
        return self::firstOrCreate(['user_id' => $userId]);
    }

    /**
     * Check if user should receive email notifications for a type.
     */
    public function shouldReceiveEmail(string $type): bool
    {
        return match($type) {
            'care_cases' => $this->email_care_cases,
            'follow_ups' => $this->email_follow_ups,
            'celebrations' => $this->email_celebrations,
            'sms' => $this->email_sms,
            default => true,
        };
    }

    /**
     * Check if user should receive database notifications for a type.
     */
    public function shouldReceiveDatabase(string $type): bool
    {
        return match($type) {
            'care_cases' => $this->database_care_cases,
            'follow_ups' => $this->database_follow_ups,
            'celebrations' => $this->database_celebrations,
            'sms' => $this->database_sms,
            default => true,
        };
    }
}
