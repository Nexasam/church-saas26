<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $notifications = $user->notifications()
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('notifications', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $user = auth()->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        $user = auth()->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->delete();
        }

        return response()->json(['success' => true]);
    }

    public function preferences(Request $request)
    {
        $preferences = NotificationPreference::forUser(auth()->id());

        return response()->json([
            'email_care_cases' => $preferences->email_care_cases,
            'email_follow_ups' => $preferences->email_follow_ups,
            'email_celebrations' => $preferences->email_celebrations,
            'email_sms' => $preferences->email_sms,
            'database_care_cases' => $preferences->database_care_cases,
            'database_follow_ups' => $preferences->database_follow_ups,
            'database_celebrations' => $preferences->database_celebrations,
            'database_sms' => $preferences->database_sms,
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'email_care_cases' => ['boolean'],
            'email_follow_ups' => ['boolean'],
            'email_celebrations' => ['boolean'],
            'email_sms' => ['boolean'],
            'database_care_cases' => ['boolean'],
            'database_follow_ups' => ['boolean'],
            'database_celebrations' => ['boolean'],
            'database_sms' => ['boolean'],
        ]);

        $preferences = NotificationPreference::forUser(auth()->id());
        $preferences->update($validated);

        return response()->json(['success' => true]);
    }
}
