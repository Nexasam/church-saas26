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
    /** Plan limits: monthly SMS units */
    private const PLAN_LIMITS = [
        'starter'    => 300,
        'growth'     => 500,
        'enterprise' => 1000,
        'free'       => 50,
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
        $churchId  = auth()->user()->church_id;
        $church    = auth()->user()->church;
        $plan      = $church?->payment_category ?? 'growth';
        $limit     = self::PLAN_LIMITS[$plan] ?? 500;

        $now       = now();
        $usedThisMonth = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->sum('sms_units_used');

        $history = SmsCampaign::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'title'       => $s->title,
                'message'     => $s->message,
                'recipients'  => $s->recipients_count,
                'sent'        => $s->sent_count,
                'failed'      => $s->failed_count,
                'status'      => $s->status,
                'date'        => $s->created_at->format('Y-m-d H:i'),
                'type'        => $s->type,
            ]);

        // Recipient group counts (real from DB)
        $memberCount  = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId))->count();
        $activeCount  = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true))->count();

        $recipientGroups = [
            ['id' => 'all',        'label' => 'All Members',         'count' => $memberCount],
            ['id' => 'active',     'label' => 'Active Members',      'count' => $activeCount],
            ['id' => 'followup',   'label' => 'Follow-Up List',      'count' => 0], // filled by follow-ups table later
            ['id' => 'evangelism', 'label' => 'Evangelism Dept',     'count' => 0],
            ['id' => 'workers',    'label' => 'All Workers',         'count' => $activeCount],
            ['id' => 'homeChurch', 'label' => 'Home Church Leaders', 'count' => 0],
        ];

        // Members for individual search
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
            'plan'             => $plan,
            'smsLimit'         => $limit,
            'smsUsed'          => (int) $usedThisMonth,
            'history'          => $history,
            'recipientGroups'  => $recipientGroups,
            'members'          => $members,
        ]);
    }

    /** Send bulk SMS */
    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'title'           => ['required', 'string', 'max:200'],
            'message'         => ['required', 'string', 'max:480'],
            'recipient_group' => ['required', 'string', 'max:50'],
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

        // Notify sender about delivery status
        auth()->user()->notify(new SmsDeliveryNotification($campaign));

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

    private function getPhonesForGroup(string $group, int $churchId): array
    {
        $query = Member::whereHas('churches', fn($q) => $q->where('churches.id', $churchId));

        if ($group === 'active') {
            $query->whereHas('churches', fn($q) => $q->where('churches.id', $churchId)->where('church_member.is_active', true));
        }

        return $query->whereNotNull('phone')->pluck('phone')->toArray();
    }

    /**
     * Dispatch SMS via Termii (or mock if no key configured).
     * Returns [sent_count, failed_count].
     */
    private function dispatchSms(array $phones, string $message, string $senderName): array
    {
        $apiKey  = config('services.termii.key');
        $senderId = config('services.termii.sender_id', 'N-Alert');

        if (! $apiKey || app()->environment('local', 'testing')) {
            // In development, simulate success
            return [count($phones), 0];
        }

        $sent   = 0;
        $failed = 0;

        foreach (array_chunk($phones, 50) as $batch) {
            try {
                $response = Http::post('https://api.ng.termii.com/api/sms/send/bulk', [
                    'api_key'  => $apiKey,
                    'to'       => $batch,
                    'from'     => $senderId,
                    'sms'      => $message,
                    'type'     => 'plain',
                    'channel'  => 'dnd',
                ]);

                if ($response->successful()) {
                    $sent += count($batch);
                } else {
                    $failed += count($batch);
                }
            } catch (\Exception) {
                $failed += count($batch);
            }
        }

        return [$sent, $failed];
    }
}
