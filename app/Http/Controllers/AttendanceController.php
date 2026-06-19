<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Member;
use App\Models\ServiceAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Show the attendance page.
     */
    public function index(Request $request)
    {
        $churchId    = auth()->user()->church_id;
        $year        = $request->integer('year',  now()->year);
        $month       = $request->integer('month', now()->month);
        $serviceType = $request->string('service_type', 'sunday');
        $deptFilter  = $request->string('department', 'all');

        // Generate session dates for the selected month+type
        $dates = $this->getServiceDates($year, $month, $serviceType);

        // Members filtered by department
        $membersQuery = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId));
        if ($deptFilter !== 'all') {
            $membersQuery->whereHas('departments', fn ($q) =>
                $q->where('departments.church_id', $churchId)->where('departments.name', $deptFilter)
            );
        }
        $members = $membersQuery
            ->with(['departments' => fn ($q) => $q->where('departments.church_id', $churchId)->select('departments.id', 'departments.name')])
            ->orderBy('first_name')
            ->get()
            ->map(fn (Member $m) => [
                'id'          => $m->id,
                'name'        => $m->first_name . ' ' . $m->last_name,
                'initials'    => strtoupper(substr($m->first_name, 0, 1) . substr($m->last_name, 0, 1)),
                'phone'       => $m->phone,
                'departments' => $m->departments->pluck('name')->toArray(),
            ]);

        // Existing attendance records for this month
        $attendanceRecords = ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('service_date', $year)
            ->whereMonth('service_date', $month)
            ->whereIn('service_date', $dates)
            ->get(['member_id', 'service_date', 'status', 'service_name']);

        // Build attendance map: [member_id][date] = status
        $attendanceMap = [];
        foreach ($attendanceRecords as $rec) {
            $attendanceMap[$rec->member_id][$rec->service_date] = $rec->status;
        }

        $departments = Department::where('church_id', $churchId)->orderBy('name')->get(['id', 'name']);

        // Summary stats for displayed dates
        $summary = [];
        foreach ($dates as $date) {
            $records = $attendanceRecords->where('service_date', $date);
            $summary[$date] = [
                'present' => $records->where('status', 'present')->count(),
                'absent'  => $records->where('status', 'absent')->count(),
                'excused' => $records->where('status', 'excused')->count(),
                'total'   => $members->count(),
            ];
        }

        return Inertia::render('attendance', [
            'members'       => $members,
            'dates'         => $dates,
            'attendanceMap' => $attendanceMap,
            'departments'   => $departments,
            'summary'       => $summary,
            'filters'       => [
                'year'         => $year,
                'month'        => $month,
                'service_type' => $serviceType,
                'department'   => $deptFilter,
            ],
        ]);
    }

    /**
     * Mark attendance for one member on one date.
     */
    public function mark(Request $request)
    {
        $validated = $request->validate([
            'member_id'    => ['required', 'integer', 'exists:members,id'],
            'service_date' => ['required', 'date'],
            'service_name' => ['required', 'string', 'max:100'],
            'status'       => ['required', 'in:present,absent,excused'],
        ]);

        $churchId = auth()->user()->church_id;

        ServiceAttendance::withoutGlobalScopes()->updateOrCreate(
            [
                'church_id'    => $churchId,
                'member_id'    => $validated['member_id'],
                'service_date' => $validated['service_date'],
                'service_name' => $validated['service_name'],
            ],
            [
                'status'    => $validated['status'],
                'marked_by' => auth()->user()->name,
            ]
        );

        return back();
    }

    /**
     * Bulk mark attendance for multiple members on one date.
     */
    public function bulkMark(Request $request)
    {
        $validated = $request->validate([
            'member_ids'   => ['required', 'array', 'min:1'],
            'member_ids.*' => ['integer', 'exists:members,id'],
            'service_date' => ['required', 'date'],
            'service_name' => ['required', 'string', 'max:100'],
            'status'       => ['required', 'in:present,absent,excused'],
        ]);

        $churchId  = auth()->user()->church_id;
        $markedBy  = auth()->user()->name;
        $now       = now();

        DB::transaction(function () use ($validated, $churchId, $markedBy, $now) {
            foreach ($validated['member_ids'] as $memberId) {
                ServiceAttendance::withoutGlobalScopes()->updateOrCreate(
                    [
                        'church_id'    => $churchId,
                        'member_id'    => $memberId,
                        'service_date' => $validated['service_date'],
                        'service_name' => $validated['service_name'],
                    ],
                    [
                        'status'     => $validated['status'],
                        'marked_by'  => $markedBy,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }
        });

        return back()->with('success', count($validated['member_ids']) . ' records updated.');
    }

    /**
     * Export attendance for a month as CSV.
     */
    public function export(Request $request)
    {
        $churchId    = auth()->user()->church_id;
        $year        = $request->integer('year',  now()->year);
        $month       = $request->integer('month', now()->month);
        $serviceType = $request->string('service_type', 'sunday');

        $dates   = $this->getServiceDates($year, $month, $serviceType);
        $members = Member::whereHas('churches', fn ($q) => $q->where('churches.id', $churchId))
            ->orderBy('first_name')->get();

        $records = ServiceAttendance::withoutGlobalScopes()
            ->where('church_id', $churchId)
            ->whereYear('service_date', $year)
            ->whereMonth('service_date', $month)
            ->whereIn('service_date', $dates)
            ->get();

        $map = [];
        foreach ($records as $r) {
            $map[$r->member_id][$r->service_date] = $r->status;
        }

        $header = array_merge(['Name', 'Phone'], $dates, ['Attendance Rate']);
        $rows   = [$header];

        foreach ($members as $m) {
            $row = [$m->first_name . ' ' . $m->last_name, $m->phone ?? ''];
            $present = 0;
            foreach ($dates as $d) {
                $status = $map[$m->id][$d] ?? 'unmarked';
                $row[]  = $status;
                if ($status === 'present') $present++;
            }
            $row[] = count($dates) > 0 ? round(($present / count($dates)) * 100) . '%' : '—';
            $rows[] = $row;
        }

        $csv      = implode("\n", array_map(fn ($r) => implode(',', array_map(fn ($c) => '"' . str_replace('"', '""', $c) . '"', $r)), $rows));
        $filename = "attendance_{$year}_{$month}_{$serviceType}.csv";

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function getServiceDates(int $year, int $month, string $type): array
    {
        $dates    = [];
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $dayMap   = ['sunday' => 0, 'midweek' => 3, 'prayer' => 5, 'home_church' => 6];

        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = \Carbon\Carbon::create($year, $month, $d);
            $str  = $date->toDateString();

            if ($type === 'special' && $d === 15) {
                $dates[] = $str;
            } elseif (isset($dayMap[$type]) && $date->dayOfWeek === $dayMap[$type]) {
                $dates[] = $str;
            }
        }

        return $dates;
    }
}
