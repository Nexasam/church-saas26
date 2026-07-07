<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\SmsCampaign;
use App\Models\SmsUsage;
use App\Models\User;
use App\Notifications\SmsDeliveryNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SmsController extends Controller
{
    private const PLAN_LIMITS = [
        'starter'    => 1000,
        'growth'     => 5000,
        'enterprise' => 50000,
        'free'       => 10000,  // bumped for testing
        'paid'       => 10000,
    ];

    /** Recipient group definitions */
    private const RECIPIENT_GROUPS = [
        ['id' => 'all',        'label' => 'All Members',         'scope' => 'all'],
        ['id' => 'active',     'label' => 'Active Members',      'scope' => 'active'],
        ['id' => 'followup',   'label' => 'Follow-Up List',      'scope' => 'followup'],
        ['id' => 'evangelism', 'label' => 'Evangelism Dept',     'scope' => 'dept:Evangelism'],
        ['id' => 'workers',    'label' => 'All Workers',         'scope' => 'active'],
        ['id' => 'homeChurch', 'label' => 'Home Church Leaders', 'scope' => 'active'],
    ];

    public function index()
    {
        $churchId = auth()->user()->church_id;
        $church   = auth()->user()->church;
        $plan     = $church?->payment_category ?? 'free';
        $limit    = self::PLAN_LIMITS[$plan] ?? 50;

        $usedThisMonth = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('sms_units_used');

        $history = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'title'      => $s->title,
                'message'    => $s->message,
                'recipients' => $s->recipients_count,
                'sent'       => $s->sent_count,
                'failed'     => $s->failed_count,
                'status'     => $s->status,
                'date'       => $s->created_at->format('Y-m-d H:i'),
                'type'       => $s->type,
            ]);

        $memberCount = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))->count();
        $activeCount = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true))->count();
        $workerCount = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->whereHas('departments', fn($q) => $q->where('departments.church_id', $churchId))
            ->count();

        $recipientGroups = [
            ['id' => 'all',     'label' => 'All Members',    'count' => $memberCount, 'group_type' => 'all'],
            ['id' => 'active',  'label' => 'Active Members', 'count' => $activeCount, 'group_type' => 'active'],
            ['id' => 'workers', 'label' => 'All Workers',    'count' => $workerCount, 'group_type' => 'workers'],
        ];

        // Departments list for targeting
        $departments = \App\Models\Department::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->with(['leaders'])
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(fn($d) => [
                'id'           => $d->id,
                'name'         => $d->name,
                'member_count' => $d->members_count,
                'leader_name'  => $d->leaders->first()
                    ? trim($d->leaders->first()->first_name . ' ' . $d->leaders->first()->last_name)
                    : null,
                'leader_id'    => $d->leaders->first()?->id,
            ]);

        $members = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'phone'])
            ->map(fn($m) => [
                'id'       => $m->id,
                'name'     => trim($m->first_name . ' ' . $m->last_name),
                'initials' => strtoupper(substr($m->first_name, 0, 1) . substr($m->last_name, 0, 1)),
                'phone'    => $m->phone,
            ]);

        return Inertia::render('sms', [
            'plan'            => $plan,
            'smsLimit'        => $limit,
            'smsUsed'         => (int) $usedThisMonth,
            'history'         => $history,
            'recipientGroups' => $recipientGroups,
            'departments'     => $departments,
            'members'         => $members,
        ]);
    }

    /** Send bulk SMS */
    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'title'           => ['required', 'string', 'max:200'],
            'message'         => ['required', 'string', 'max:480'],
            'recipient_group' => ['required', 'string', 'max:100'],
            'recipients_count'=> ['required', 'integer', 'min:1'],
            'sms_units'       => ['required', 'integer', 'min:1'],
        ]);

        $churchId = auth()->user()->church_id;
        $church   = auth()->user()->church;
        $plan     = $church?->payment_category ?? 'growth';
        $limit    = self::PLAN_LIMITS[$plan] ?? 500;

        // Quota check
        $used = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('sms_units_used');

        if (($used + $validated['sms_units']) > $limit) {
            return back()->withErrors(['quota' => 'SMS quota exceeded. Please upgrade your plan.']);
        }

        // Fetch real phone numbers
        $phones = $this->getPhonesForGroup($validated['recipient_group'], $churchId);

        $campaign = SmsCampaign::create([
            'title'            => $validated['title'],
            'message'          => $validated['message'],
            'recipient_group'  => $validated['recipient_group'],
            'type'             => 'bulk',
            'recipients_count' => count($phones),
            'sms_units_used'   => $validated['sms_units'],
            'status'           => 'pending',
            'sent_by'          => auth()->id(),
        ]);

        // Fire SMS via provider (Termii or Twilio)
        [$sent, $failed] = $this->dispatchSms($phones, $validated['message'], $church?->name ?? 'Church');

        $campaign->update([
            'sent_count'   => $sent,
            'failed_count' => $failed,
            'status'       => 'sent',
            'sent_at'      => now(),
        ]);

        // Notify sender
        auth()->user()->notify(new SmsDeliveryNotification($campaign));

        // Notify recipient workers via database notification
        $this->notifyRecipientWorkers($campaign, $validated['recipient_group'], $churchId);

        return back()->with('success', "Campaign \"{$validated['title']}\" sent to {$sent} members.");
    }

    /** Send individual SMS */
    public function sendIndividual(Request $request)
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'message'   => ['required', 'string', 'max:480'],
        ]);

        $member   = Member::findOrFail($validated['member_id']);
        $churchId = auth()->user()->church_id;
        $church   = auth()->user()->church;

        if (! $member->phone) {
            return back()->withErrors(['phone' => 'This member has no phone number on record.']);
        }

        [$sent, $failed] = $this->dispatchSms([$member->phone], $validated['message'], $church?->name ?? 'Church');

        SmsCampaign::create([
            'title'            => $member->first_name . ' ' . $member->last_name,
            'message'          => $validated['message'],
            'recipient_group'  => 'individual',
            'type'             => 'individual',
            'recipient_name'   => $member->first_name . ' ' . $member->last_name,
            'recipient_phone'  => $member->phone,
            'recipients_count' => 1,
            'sent_count'       => $sent,
            'failed_count'     => $failed,
            'sms_units_used'   => 1,
            'status'           => $sent ? 'sent' : 'failed',
            'sent_at'          => now(),
            'sent_by'          => auth()->id(),
        ]);

        return back()->with('success', "SMS sent to {$member->first_name}.");
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function notifyRecipientWorkers(SmsCampaign $campaign, string $group, int $churchId): void
    {
        // Find users to notify based on group
        $userQuery = \App\Models\User::withoutGlobalScopes()->where('church_id', $churchId);

        if (str_starts_with($group, 'dept:')) {
            $deptId = (int) substr($group, 5);
            $label  = 'Department message';
            // Users whose member email matches someone in this department
            $emails = Member::whereHas('departments', fn($q) => $q->where('departments.id', $deptId))
                ->whereNotNull('email')->pluck('email');
            $userQuery->whereIn('email', $emails);
        } elseif (str_starts_with($group, 'leader:')) {
            $deptId = (int) substr($group, 7);
            $label  = 'Message to department leader';
            $emails = Member::whereHas('departments', fn($q) =>
                $q->where('departments.id', $deptId)->where('department_member.role', 'leader')
            )->whereNotNull('email')->pluck('email');
            $userQuery->whereIn('email', $emails);
        } elseif ($group === 'workers') {
            $label = 'Message to all workers';
            $emails = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))
                ->whereHas('departments')->whereNotNull('email')->pluck('email');
            $userQuery->whereIn('email', $emails);
        } else {
            // all / active — notify all users in the church except the sender
            $label = 'Church-wide message';
            $userQuery->where('id', '!=', auth()->id());
        }

        $notification = new \App\Notifications\WorkerSmsNotification($campaign, $label);

        $userQuery->where('id', '!=', auth()->id())
            ->get()
            ->each(fn ($u) => $u->notify($notification));
    }

    private function getPhonesForGroup(string $group, int $churchId): array
    {
        // Department all workers: dept:123
        if (str_starts_with($group, 'dept:')) {
            $deptId = (int) substr($group, 5);
            return Member::whereHas('departments', fn($q) => $q->where('departments.id', $deptId))
                ->whereNotNull('phone')->pluck('phone')->toArray();
        }

        // Department leader only: leader:123
        if (str_starts_with($group, 'leader:')) {
            $deptId = (int) substr($group, 7);
            return Member::whereHas('departments', fn($q) =>
                $q->where('departments.id', $deptId)->where('department_member.role', 'leader')
            )->whereNotNull('phone')->pluck('phone')->toArray();
        }

        $query = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId));

        if ($group === 'active') {
            $query->whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true));
        } elseif ($group === 'workers') {
            $query->whereHas('departments', fn($q) => $q->where('departments.church_id', $churchId));
        }

        return $query->whereNotNull('phone')->pluck('phone')->toArray();
    }

    /**
     * Dispatch SMS via configured provider (Termii or Twilio).
     * In local/testing env simulates success unless a real key is present.
     * Returns [sent_count, failed_count].
     */
    private function dispatchSms(array $phones, string $message, string $senderName): array
    {
        $provider = config('services.sms.provider', 'termii');

        // Normalize phones — remove spaces and ensure international format
        $phones = array_values(array_filter(array_map(
            fn($p) => $this->normalizePhone($p),
            $phones
        )));

        if (empty($phones)) {
            return [0, 0];
        }

        // In local/testing without keys → simulate success
        $termiiKey  = config('services.termii.key');
        $twilioSid  = config('services.twilio.sid');
        $hasKey     = $provider === 'termii' ? ! empty($termiiKey) : ! empty($twilioSid);

        if (! $hasKey) {
            \Log::info("[SMS MOCK] No API key configured. Would send to " . count($phones) . " recipients via {$provider}", [
                'message' => $message,
                'phones'  => array_slice($phones, 0, 5),
            ]);
            return [count($phones), 0];
        }

        return $provider === 'twilio'
            ? $this->dispatchViaTwilio($phones, $message)
            : $this->dispatchViaTermii($phones, $message);
    }

    /**
     * Send via Termii bulk SMS API.
     */
    private function dispatchViaTermii(array $phones, string $message): array
    {
        $apiKey   = config('services.termii.key');
        $senderId = config('services.termii.sender_id', 'N-Alert');
        $channel  = config('services.termii.channel', 'generic');

        $sent = $failed = 0;

        foreach (array_chunk($phones, 100) as $batch) {
            try {
                $response = Http::timeout(30)->post('https://api.ng.termii.com/api/sms/send/bulk', [
                    'api_key'    => $apiKey,
                    'to'         => $batch,
                    'from'       => $senderId,
                    'sms'        => $message,
                    'type'       => 'plain',
                    'channel'    => $channel,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    // Termii returns message_id array on success
                    $sent += is_array($data['message_id'] ?? null)
                        ? count($data['message_id'])
                        : count($batch);
                } else {
                    \Log::warning('[Termii SMS] Failed batch', [
                        'status' => $response->status(),
                        'body'   => $response->body(),
                    ]);
                    $failed += count($batch);
                }
            } catch (\Exception $e) {
                \Log::error('[Termii SMS] Exception', ['error' => $e->getMessage()]);
                $failed += count($batch);
            }
        }

        return [$sent, $failed];
    }

    /**
     * Send via Twilio API (one request per recipient — Twilio has no bulk API).
     */
    private function dispatchViaTwilio(array $phones, string $message): array
    {
        $sid   = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from  = config('services.twilio.from');

        $sent = $failed = 0;
        $baseUrl = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

        foreach ($phones as $phone) {
            try {
                $response = Http::timeout(15)
                    ->withBasicAuth($sid, $token)
                    ->asForm()
                    ->post($baseUrl, [
                        'From' => $from,
                        'To'   => $phone,
                        'Body' => $message,
                    ]);

                if ($response->successful() && isset($response->json()['sid'])) {
                    $sent++;
                } else {
                    \Log::warning('[Twilio SMS] Failed', [
                        'phone'  => $phone,
                        'status' => $response->status(),
                        'body'   => $response->body(),
                    ]);
                    $failed++;
                }
            } catch (\Exception $e) {
                \Log::error('[Twilio SMS] Exception', ['error' => $e->getMessage(), 'phone' => $phone]);
                $failed++;
            }
        }

        return [$sent, $failed];
    }

    /**
     * Normalize a phone number to international format.
     * Nigerian numbers: 0801... → +234801...
     */
    private function normalizePhone(?string $phone): ?string
    {
        if (! $phone) return null;

        // Strip all non-digit characters except leading +
        $clean = preg_replace('/[^\d+]/', '', $phone);

        // Already international
        if (str_starts_with($clean, '+')) return $clean;

        // Nigerian local format: 0XXXXXXXXXX → +234XXXXXXXXXX
        if (preg_match('/^0[7-9][0-1]\d{8}$/', $clean)) {
            return '+234' . substr($clean, 1);
        }

        // Already has country code without +
        if (preg_match('/^234\d{10}$/', $clean)) {
            return '+' . $clean;
        }

        // Return with + prefix for other formats
        return str_starts_with($clean, '+') ? $clean : '+' . $clean;
    }
}
