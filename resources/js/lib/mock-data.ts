/**
 * Church OS — Type Definitions & Utility Functions
 * 
 * NOTE: This file contains TypeScript type definitions and formatting utilities.
 * The mock data at the bottom of this file is NOT used by the application —
 * all data comes from the Laravel backend via Inertia props.
 * 
 * Keep the types and utility functions (formatCurrency, formatNumber).
 * The mock data arrays can be safely removed if desired, or kept as reference examples.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChurchTenant = {
    id: number;
    name: string;
    logo?: string;
    branch?: string;
    plan: 'starter' | 'growth' | 'enterprise';
    memberCount: number;
    location: string;
};

export type DashboardMetrics = {
    soulsWon: { value: number; trend: number; sparkline: number[] };
    activeMembers: { value: number; trend: number; sparkline: number[] };
    pendingFollowUps: { value: number; trend: number; urgent: number };
    monthlyIncome: { value: number; trend: number; sparkline: number[] };
    conversionRate: { value: number; trend: number };
    attendance: { value: number; trend: number; sparkline: number[] };
};

export type FollowUpStage =
    | 'visitor'
    | 'first_contact'
    | 'follow_up'
    | 'membership_class'
    | 'worker'
    | 'established';

export type FollowUpCard = {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    phone: string;
    stage: FollowUpStage;
    assignedTo: string;
    assignedAvatar?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    lastContact: string;
    nextAction: string;
    daysInStage: number;
    source: string;
    notes?: string;
    prayerRequest?: string;
    tags: string[];
};

export type Member = {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    email: string;
    phone: string;
    gender: 'male' | 'female';
    dob?: string;
    address?: string;
    occupation?: string;
    status: 'active' | 'inactive' | 'new';
    membershipType: 'full' | 'associate' | 'visitor';
    joinedAt: string;
    departments: string[];
    homeChurch?: string;
    lastAttendance?: string;
    attendanceRate: number;
    followUpStage?: FollowUpStage;
    notes?: string;
    tags: string[];
    timeline: TimelineEvent[];
};

export type TimelineEvent = {
    id: string;
    date: string;
    type: 'attendance' | 'follow_up' | 'note' | 'prayer' | 'milestone' | 'task';
    title: string;
    description?: string;
    actor?: string;
};

export type EvangelismRecord = {
    id: string;
    memberId?: string;
    name: string;
    phone?: string;
    avatar?: string;
    initials: string;
    stage: 'soul_won' | 'visited' | 'membership_class' | 'worker' | 'established';
    wonBy: string;
    wonDate: string;
    source: 'invited' | 'outreach' | 'social_media' | 'service' | 'evangelism' | 'member' | 'self';
    location?: string;
    followUps: number;
    lastFollowUp?: string;
    autoSchedule?: FollowUpScheduleItem[];
};

export type FollowUpScheduleItem = {
    day: number;
    label: string;
    dueDate: string;
    status: 'pending' | 'done' | 'overdue';
    completedBy?: string;
};

export type FollowUpTask = {
    id: string;
    followUpId: string;
    personName: string;
    type: 'call' | 'visit' | 'prayer_meeting' | 'invite_to_service' | 'message';
    assignedTo: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'done' | 'escalated';
    notes?: string;
    createdAt: string;
};

export type AutomationEvent = {
    id: string;
    type: 'missed_service' | 'follow_up_overdue' | 'soul_won' | 'care_escalated';
    personName: string;
    triggeredAt: string;
    action: string;
    escalationLevel: 0 | 1 | 2; // 0=worker, 1=dept head, 2=pastor
    resolved: boolean;
};

export type FinanceTransaction = {
    id: string;
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
    method: 'cash' | 'transfer' | 'pos' | 'cheque';
    reference?: string;
    recordedBy: string;
    status: 'confirmed' | 'pending' | 'reconciled';
};

export type ServiceOffering = {
    id: string;
    serviceName: string;
    serviceDate: string;
    recordedAmount: number;
    bankedAmount?: number;
    bankedDate?: string;
    reconciliationStatus: 'pending' | 'matched' | 'variance' | 'investigating';
    variance?: number;
    reconciledBy?: string;
    collector: string;
    attendance: number;
};

export type Department = {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    leader: string;
    leader_id: number | null;
    leaderAvatar?: string;
    member_count: number;
    active_count: number;
    created_at: string;
    last_activity: string;
};

export type CareCase = {
    id: string;
    memberId: string;
    memberName: string;
    memberAvatar?: string;
    type: 'hospital' | 'bereavement' | 'counseling' | 'crisis' | 'prayer' | 'general';
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'escalated';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    notes: string[];
};

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    role: 'super_admin' | 'admin' | 'pastor' | 'worker' | 'finance' | 'viewer';
    departments: string[];
    status: 'active' | 'suspended' | 'pending';
    lastLogin?: string;
    joinedAt: string;
    permissions: string[];
};

export type Notification = {
    id: string;
    type: 'follow_up' | 'finance' | 'system' | 'care' | 'escalation';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
    actor?: string;
};

export type ActivityFeedItem = {
    id: string;
    type: 'member_joined' | 'soul_won' | 'follow_up' | 'finance' | 'attendance' | 'care' | 'department';
    title: string;
    description: string;
    actor: string;
    actorAvatar?: string;
    timestamp: string;
    meta?: Record<string, string | number>;
};

// ─── Mock Tenants ─────────────────────────────────────────────────────────────

export const mockTenants: ChurchTenant[] = [
    {
        id: 1,
        name: 'Grace Assembly',
        branch: 'Main Campus',
        plan: 'growth',
        memberCount: 842,
        location: 'Lagos, Nigeria',
    },
    {
        id: 2,
        name: 'Grace Assembly',
        branch: 'Abuja Campus',
        plan: 'growth',
        memberCount: 316,
        location: 'Abuja, Nigeria',
    },
    {
        id: 3,
        name: 'Lighthouse Church',
        branch: 'Port Harcourt',
        plan: 'starter',
        memberCount: 187,
        location: 'Port Harcourt, Nigeria',
    },
];

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export const mockDashboardMetrics: DashboardMetrics = {
    soulsWon: {
        value: 47,
        trend: 12.5,
        sparkline: [3, 5, 4, 8, 6, 9, 7, 11, 8, 12, 9, 14],
    },
    activeMembers: {
        value: 842,
        trend: 4.2,
        sparkline: [780, 790, 805, 800, 815, 820, 828, 835, 830, 838, 840, 842],
    },
    pendingFollowUps: {
        value: 38,
        trend: -8.3,
        urgent: 7,
    },
    monthlyIncome: {
        value: 4280000,
        trend: 18.7,
        sparkline: [2800000, 3100000, 2950000, 3400000, 3200000, 3600000, 3800000, 3500000, 4000000, 3900000, 4100000, 4280000],
    },
    conversionRate: {
        value: 68.4,
        trend: 5.2,
    },
    attendance: {
        value: 634,
        trend: 2.8,
        sparkline: [580, 595, 610, 600, 615, 620, 628, 618, 625, 630, 628, 634],
    },
};

// ─── Follow-Up Cards ──────────────────────────────────────────────────────────

export const mockFollowUpCards: FollowUpCard[] = [
    {
        id: 'fu-001',
        name: 'Chukwuemeka Obi',
        initials: 'CO',
        phone: '+234 803 456 7890',
        stage: 'visitor',
        assignedTo: 'Bro. Samuel',
        priority: 'high',
        lastContact: '2 days ago',
        nextAction: 'Call to invite to service',
        daysInStage: 3,
        source: 'Outreach',
        tags: ['New Contact', 'Outreach'],
    },
    {
        id: 'fu-002',
        name: 'Adaeze Nwachukwu',
        initials: 'AN',
        phone: '+234 810 234 5678',
        stage: 'visitor',
        assignedTo: 'Sis. Grace',
        priority: 'medium',
        lastContact: '1 day ago',
        nextAction: 'Send welcome message',
        daysInStage: 2,
        source: 'Service',
        tags: ['First Visit'],
    },
    {
        id: 'fu-003',
        name: 'Oluwafemi Adeleke',
        initials: 'OA',
        phone: '+234 706 789 0123',
        stage: 'visitor',
        assignedTo: 'Bro. James',
        priority: 'low',
        lastContact: '4 days ago',
        nextAction: 'Visit at home',
        daysInStage: 7,
        source: 'Social Media',
        tags: ['Online', 'Youth'],
    },
    {
        id: 'fu-004',
        name: 'Ngozi Okonkwo',
        initials: 'NO',
        phone: '+234 815 345 6789',
        stage: 'first_contact',
        assignedTo: 'Sis. Ruth',
        priority: 'medium',
        lastContact: '3 hours ago',
        nextAction: 'Schedule home visit',
        daysInStage: 5,
        source: 'Invited',
        tags: ['Invited', 'Interested'],
        prayerRequest: 'Healing for father',
    },
    {
        id: 'fu-005',
        name: 'Babatunde Fashola',
        initials: 'BF',
        phone: '+234 703 567 8901',
        stage: 'first_contact',
        assignedTo: 'Bro. Peter',
        priority: 'urgent',
        lastContact: '6 days ago',
        nextAction: 'Escalate — no response',
        daysInStage: 10,
        source: 'Evangelism',
        tags: ['Evangelism', 'No Response'],
    },
    {
        id: 'fu-006',
        name: 'Ifeoma Ezeh',
        initials: 'IE',
        phone: '+234 802 678 9012',
        stage: 'follow_up',
        assignedTo: 'Sis. Peace',
        priority: 'high',
        lastContact: '1 day ago',
        nextAction: 'Pray for family situation',
        daysInStage: 8,
        source: 'Outreach',
        tags: ['Prayer Need', 'Family'],
        prayerRequest: 'Job opportunity needed',
    },
    {
        id: 'fu-007',
        name: 'Emeka Igwe',
        initials: 'EI',
        phone: '+234 817 890 1234',
        stage: 'follow_up',
        assignedTo: 'Bro. David',
        priority: 'medium',
        lastContact: '2 days ago',
        nextAction: 'Attend midweek service',
        daysInStage: 12,
        source: 'Service',
        tags: ['Regular Visitor'],
    },
    {
        id: 'fu-008',
        name: 'Chidinma Okeke',
        initials: 'CO',
        phone: '+234 806 901 2345',
        stage: 'membership_class',
        assignedTo: 'Pastor Mike',
        priority: 'medium',
        lastContact: 'Today',
        nextAction: 'Complete class module 3',
        daysInStage: 14,
        source: 'Service',
        tags: ['Class Student'],
    },
    {
        id: 'fu-009',
        name: 'Seun Adesanya',
        initials: 'SA',
        phone: '+234 813 012 3456',
        stage: 'membership_class',
        assignedTo: 'Pastor Mike',
        priority: 'low',
        lastContact: 'Yesterday',
        nextAction: 'Final class session',
        daysInStage: 21,
        source: 'Invited',
        tags: ['Class Student', 'Almost Done'],
    },
    {
        id: 'fu-010',
        name: 'Amaka Ugwu',
        initials: 'AU',
        phone: '+234 804 123 4567',
        stage: 'worker',
        assignedTo: 'Dept. Leader',
        priority: 'low',
        lastContact: 'Today',
        nextAction: 'Assign to ushering dept',
        daysInStage: 30,
        source: 'Service',
        tags: ['New Worker'],
    },
    {
        id: 'fu-011',
        name: 'Chidi Nwosu',
        initials: 'CN',
        phone: '+234 807 234 5678',
        stage: 'established',
        assignedTo: 'Bro. James',
        priority: 'low',
        lastContact: '1 week ago',
        nextAction: 'Quarterly check-in',
        daysInStage: 90,
        source: 'Service',
        tags: ['Established', 'Usher'],
    },
    {
        id: 'fu-012',
        name: 'Blessing Eze',
        initials: 'BE',
        phone: '+234 811 345 6789',
        stage: 'established',
        assignedTo: 'Sis. Ruth',
        priority: 'low',
        lastContact: '5 days ago',
        nextAction: 'Monthly discipleship',
        daysInStage: 120,
        source: 'Evangelism',
        tags: ['Established', 'Choir'],
    },
];

// ─── Members ──────────────────────────────────────────────────────────────────

export const mockMembers: Member[] = [
    {
        id: 'm-001',
        name: 'Chidi Nwosu',
        initials: 'CN',
        email: 'chidi.nwosu@email.com',
        phone: '+234 807 234 5678',
        gender: 'male',
        dob: '1990-03-15',
        address: '14 Palm Ave, Lekki, Lagos',
        occupation: 'Software Engineer',
        status: 'active',
        membershipType: 'full',
        joinedAt: '2023-01-15',
        departments: ['Ushering', 'Technical'],
        homeChurch: 'Zone 5 HC',
        lastAttendance: '2026-06-08',
        attendanceRate: 92,
        followUpStage: 'established',
        timeline: [
            { id: 't1', date: '2026-06-08', type: 'attendance', title: 'Attended Sunday Service', actor: 'System' },
            { id: 't2', date: '2026-05-25', type: 'note', title: 'Leadership training completed', description: 'Completed module 2', actor: 'Pastor Mike' },
            { id: 't3', date: '2026-05-01', type: 'milestone', title: 'Promoted to Ushering Lead', actor: 'Pastor Mike' },
        ],
        tags: ['Established', 'Usher', 'Technical'],
    },
    {
        id: 'm-002',
        name: 'Blessing Eze',
        initials: 'BE',
        email: 'blessing.eze@email.com',
        phone: '+234 811 345 6789',
        gender: 'female',
        status: 'active',
        membershipType: 'full',
        joinedAt: '2022-06-10',
        departments: ['Choir', 'Women Ministry'],
        homeChurch: 'Zone 3 HC',
        lastAttendance: '2026-06-08',
        attendanceRate: 88,
        followUpStage: 'established',
        timeline: [
            { id: 't1', date: '2026-06-08', type: 'attendance', title: 'Attended Sunday Service', actor: 'System' },
            { id: 't2', date: '2026-06-01', type: 'follow_up', title: 'Monthly discipleship session', actor: 'Sis. Ruth' },
        ],
        tags: ['Established', 'Choir'],
    },
    {
        id: 'm-003',
        name: 'Amaka Ugwu',
        initials: 'AU',
        email: 'amaka.ugwu@email.com',
        phone: '+234 804 123 4567',
        gender: 'female',
        status: 'active',
        membershipType: 'associate',
        joinedAt: '2025-08-20',
        departments: ['Ushering'],
        homeChurch: 'Zone 2 HC',
        lastAttendance: '2026-06-08',
        attendanceRate: 78,
        followUpStage: 'worker',
        timeline: [
            { id: 't1', date: '2026-06-08', type: 'attendance', title: 'Attended Sunday Service', actor: 'System' },
            { id: 't2', date: '2026-05-20', type: 'task', title: 'Assigned to ushering department', actor: 'Dept. Leader' },
        ],
        tags: ['New Worker'],
    },
];

// ─── Potential members ───────────────────────────────────────────────────────

export const mockEvangelismRecords: EvangelismRecord[] = [
    {
        id: 'e-001', name: 'Tunde Bakare', initials: 'TB', stage: 'established',
        wonBy: 'Bro. James', wonDate: '2026-01-15', source: 'outreach', followUps: 12, lastFollowUp: '2026-06-01',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-01-16', status: 'done', completedBy: 'Bro. James' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-01-18', status: 'done', completedBy: 'Bro. James' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-01-22', status: 'done', completedBy: 'Sis. Ruth' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-01-29', status: 'done', completedBy: 'Pastor Mike' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-02-14', status: 'done', completedBy: 'Pastor Mike' },
        ],
    },
    {
        id: 'e-002', name: 'Chioma Uba', initials: 'CU', stage: 'worker',
        wonBy: 'Sis. Ruth', wonDate: '2026-02-20', source: 'evangelism', followUps: 8, lastFollowUp: '2026-05-28',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-02-21', status: 'done', completedBy: 'Sis. Ruth' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-02-23', status: 'done', completedBy: 'Sis. Ruth' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-02-27', status: 'done', completedBy: 'Bro. Samuel' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-03-06', status: 'done', completedBy: 'Pastor Mike' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-03-22', status: 'done', completedBy: 'Pastor Mike' },
        ],
    },
    {
        id: 'e-003', name: 'Kayode Martins', initials: 'KM', stage: 'membership_class',
        wonBy: 'Bro. David', wonDate: '2026-03-10', source: 'social_media', followUps: 5, lastFollowUp: '2026-06-05',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-03-11', status: 'done', completedBy: 'Bro. David' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-03-13', status: 'done', completedBy: 'Bro. David' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-03-17', status: 'done', completedBy: 'Sis. Grace' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-03-24', status: 'pending' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-04-09', status: 'pending' },
        ],
    },
    {
        id: 'e-004', name: 'Ngozi Obi', initials: 'NO', stage: 'visited', phone: '+234 801 234 5678',
        wonBy: 'Sis. Grace', wonDate: '2026-04-05', source: 'invited', followUps: 3, lastFollowUp: '2026-06-03',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-04-06', status: 'done', completedBy: 'Sis. Grace' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-04-08', status: 'done', completedBy: 'Sis. Grace' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-04-12', status: 'overdue' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-04-19', status: 'pending' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-05-05', status: 'pending' },
        ],
    },
    {
        id: 'e-005', name: 'Emeka Dike', initials: 'ED', stage: 'soul_won', phone: '+234 802 345 6789',
        wonBy: 'Bro. Samuel', wonDate: '2026-06-08', source: 'outreach', followUps: 1, lastFollowUp: '2026-06-08',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-06-09', status: 'pending' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-06-11', status: 'pending' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-06-15', status: 'pending' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-06-22', status: 'pending' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-07-08', status: 'pending' },
        ],
    },
    {
        id: 'e-006', name: 'Adaeze Okafor', initials: 'AO', stage: 'soul_won', phone: '+234 803 456 7890',
        wonBy: 'Sis. Peace', wonDate: '2026-06-07', source: 'evangelism', followUps: 1, lastFollowUp: '2026-06-07',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-06-08', status: 'done', completedBy: 'Sis. Peace' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-06-10', status: 'pending' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-06-14', status: 'pending' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-06-21', status: 'pending' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-07-07', status: 'pending' },
        ],
    },
    {
        id: 'e-007', name: 'Victor Eze', initials: 'VE', stage: 'visited', phone: '+234 804 567 8901',
        wonBy: 'Bro. Peter', wonDate: '2026-05-25', source: 'service', followUps: 2, lastFollowUp: '2026-06-04',
        autoSchedule: [
            { day: 1, label: 'Day 1 — Welcome Call', dueDate: '2026-05-26', status: 'done', completedBy: 'Bro. Peter' },
            { day: 3, label: 'Day 3 — Check-in', dueDate: '2026-05-28', status: 'done', completedBy: 'Bro. Peter' },
            { day: 7, label: 'Day 7 — Home Visit', dueDate: '2026-06-01', status: 'overdue' },
            { day: 14, label: 'Day 14 — Membership Class Invite', dueDate: '2026-06-08', status: 'pending' },
            { day: 30, label: 'Day 30 — Progress Review', dueDate: '2026-06-24', status: 'pending' },
        ],
    },
];

export const mockEvangelismFunnelData = [
    { stage: 'Members Reached', count: 47, color: 'oklch(0.55 0.18 265)', pct: 100 },
    { stage: 'Visited', count: 38, color: 'oklch(0.52 0.17 230)', pct: 81 },
    { stage: 'Membership Class', count: 29, color: 'oklch(0.52 0.15 162)', pct: 62 },
    { stage: 'Worker', count: 22, color: 'oklch(0.65 0.16 84)', pct: 47 },
    { stage: 'Established', count: 18, color: 'oklch(0.52 0.15 162)', pct: 38 },
];

// ─── Finance ──────────────────────────────────────────────────────────────────

export const mockFinanceSummary = {
    totalIncome: 4280000,
    totalExpenses: 1620000,
    netBalance: 2660000,
    cashAmount: 1840000,
    bankAmount: 2440000,
    lastUpdated: '2026-06-08T18:30:00',
    monthlyTrend: [
        { month: 'Jan', income: 2800000, expenses: 1200000 },
        { month: 'Feb', income: 3100000, expenses: 1350000 },
        { month: 'Mar', income: 2950000, expenses: 1280000 },
        { month: 'Apr', income: 3400000, expenses: 1450000 },
        { month: 'May', income: 3900000, expenses: 1580000 },
        { month: 'Jun', income: 4280000, expenses: 1620000 },
    ],
};

export const mockTransactions: FinanceTransaction[] = [
    { id: 'txn-001', date: '2026-06-08', description: 'Sunday Service Offering', category: 'Tithes & Offerings', type: 'income', amount: 820000, method: 'cash', recordedBy: 'Bro. Finance', status: 'confirmed' },
    { id: 'txn-002', date: '2026-06-08', description: 'Sunday Service Transfer', category: 'Tithes & Offerings', type: 'income', amount: 340000, method: 'transfer', reference: 'TRF20260608', recordedBy: 'Bro. Finance', status: 'reconciled' },
    { id: 'txn-003', date: '2026-06-07', description: 'Midweek Offering', category: 'Tithes & Offerings', type: 'income', amount: 185000, method: 'cash', recordedBy: 'Sis. Finance', status: 'confirmed' },
    { id: 'txn-004', date: '2026-06-06', description: 'Generator Fuel', category: 'Utilities', type: 'expense', amount: 45000, method: 'cash', recordedBy: 'Bro. Admin', status: 'confirmed' },
    { id: 'txn-005', date: '2026-06-05', description: 'Church Sound System Repair', category: 'Equipment', type: 'expense', amount: 180000, method: 'transfer', reference: 'PAY-2026-0605', recordedBy: 'Pastor Mike', status: 'confirmed' },
    { id: 'txn-006', date: '2026-06-04', description: 'Welfare Gift — Sis. Ada', category: 'Welfare', type: 'expense', amount: 50000, method: 'transfer', recordedBy: 'Sis. Care', status: 'confirmed' },
    { id: 'txn-007', date: '2026-06-01', description: 'June Special Offering', category: 'Special Offerings', type: 'income', amount: 560000, method: 'pos', reference: 'POS-060126', recordedBy: 'Bro. Finance', status: 'reconciled' },
];

export const mockServiceOfferings: ServiceOffering[] = [
    { id: 'so-001', serviceName: 'Sunday Service', serviceDate: '2026-06-08', recordedAmount: 1160000, bankedAmount: 1160000, bankedDate: '2026-06-09', reconciliationStatus: 'matched', collector: 'Bro. Finance', attendance: 634 },
    { id: 'so-002', serviceName: 'Midweek Service', serviceDate: '2026-06-04', recordedAmount: 185000, reconciliationStatus: 'pending', collector: 'Sis. Finance', attendance: 287 },
    { id: 'so-003', serviceName: 'Sunday Service', serviceDate: '2026-06-01', recordedAmount: 980000, bankedAmount: 965000, bankedDate: '2026-06-02', reconciliationStatus: 'variance', variance: -15000, collector: 'Bro. Finance', attendance: 618 },
    { id: 'so-004', serviceName: 'Special Service', serviceDate: '2026-05-25', recordedAmount: 1420000, bankedAmount: 1420000, bankedDate: '2026-05-26', reconciliationStatus: 'matched', collector: 'Bro. Finance', attendance: 712 },
];

// ─── Departments ──────────────────────────────────────────────────────────────

export const mockDepartments: Department[] = [
    { id: 'd-001', name: 'Ushering', description: 'Service coordination and member welcome', icon: 'Users', color: 'blue', leader: 'Bro. Emmanuel', memberCount: 24, activeCount: 21, createdAt: '2023-01-01', lastActivity: '2026-06-08' },
    { id: 'd-002', name: 'Choir & Music', description: 'Worship team and musical ministry', icon: 'Music', color: 'purple', leader: 'Sis. Melody', memberCount: 18, activeCount: 16, createdAt: '2023-01-01', lastActivity: '2026-06-08' },
    { id: 'd-003', name: 'Children Ministry', description: 'Sunday school and children programs', icon: 'Heart', color: 'pink', leader: 'Sis. Joy', memberCount: 12, activeCount: 12, createdAt: '2023-01-01', lastActivity: '2026-06-08' },
    { id: 'd-004', name: 'Technical Team', description: 'Sound, media and tech support', icon: 'Monitor', color: 'green', leader: 'Bro. Chidi', memberCount: 8, activeCount: 7, createdAt: '2023-03-15', lastActivity: '2026-06-08' },
    { id: 'd-005', name: 'Evangelism', description: 'Outreach and soul winning', icon: 'Globe', color: 'orange', leader: 'Bro. Samuel', memberCount: 30, activeCount: 28, createdAt: '2023-01-01', lastActivity: '2026-06-07' },
    { id: 'd-006', name: 'Women Ministry', description: 'Women fellowship and programs', icon: 'Star', color: 'rose', leader: 'Sis. Ruth', memberCount: 45, activeCount: 40, createdAt: '2023-01-01', lastActivity: '2026-06-05' },
    { id: 'd-007', name: 'Men Ministry', description: 'Men fellowship and discipleship', icon: 'Shield', color: 'slate', leader: 'Bro. Peter', memberCount: 38, activeCount: 32, createdAt: '2023-01-01', lastActivity: '2026-06-05' },
    { id: 'd-008', name: 'Youth Ministry', description: 'Youth programs and mentorship', icon: 'Zap', color: 'yellow', leader: 'Bro. David', memberCount: 52, activeCount: 47, createdAt: '2023-01-01', lastActivity: '2026-06-06' },
];

// ─── Care Cases ───────────────────────────────────────────────────────────────

export const mockCareCases: CareCase[] = [
    { id: 'cc-001', memberId: 'm-001', memberName: 'Bro. Eze Uchenna', memberAvatar: undefined, type: 'hospital', title: 'Hospitalization — Appendix Surgery', description: 'Admitted to St. Nicholas Hospital for emergency appendix surgery', status: 'in_progress', priority: 'urgent', assignedTo: 'Sis. Care', createdAt: '2026-06-07', updatedAt: '2026-06-08', notes: ['Visited at hospital on June 8', 'Surgery successful, recovering'] },
    { id: 'cc-002', memberId: 'm-002', memberName: 'Sis. Chiamaka Obi', type: 'bereavement', title: 'Loss of Mother', description: 'Mother passed away on June 5. Family support needed.', status: 'open', priority: 'high', assignedTo: 'Pastor Mike', createdAt: '2026-06-05', updatedAt: '2026-06-05', notes: ['Called to express condolences', 'Planning church visit'] },
    { id: 'cc-003', memberId: 'm-003', memberName: 'Bro. Tunde Alabi', type: 'counseling', title: 'Marriage Counseling Request', description: 'Requested pastoral counseling for marital issues', status: 'in_progress', priority: 'medium', assignedTo: 'Pastor Mike', createdAt: '2026-05-28', updatedAt: '2026-06-06', notes: ['First session completed June 2', 'Second session scheduled June 12'] },
    { id: 'cc-004', memberId: 'm-004', memberName: 'Sis. Ada Nwosu', type: 'prayer', title: 'Job Loss — Urgent Prayer', description: 'Laid off from work, seeking financial support and prayer', status: 'open', priority: 'high', createdAt: '2026-06-08', updatedAt: '2026-06-08', notes: [] },
];

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const mockAdminUsers: AdminUser[] = [
    { id: 'a-001', name: 'Pastor Michael Adeyemi', initials: 'MA', email: 'pastor@graceassembly.org', role: 'super_admin', departments: ['All'], status: 'active', lastLogin: '2026-06-08T09:30:00', joinedAt: '2021-01-01', permissions: ['*'] },
    { id: 'a-002', name: 'Deacon Samuel Okafor', initials: 'SO', email: 'samuel.o@graceassembly.org', role: 'admin', departments: ['Evangelism', 'Follow-Up'], status: 'active', lastLogin: '2026-06-08T10:15:00', joinedAt: '2022-03-15', permissions: ['members.view', 'members.edit', 'followups.*', 'evangelism.*'] },
    { id: 'a-003', name: 'Sis. Ruth Okonkwo', initials: 'RO', email: 'ruth.o@graceassembly.org', role: 'pastor', departments: ['Women Ministry', 'Care'], status: 'active', lastLogin: '2026-06-07T16:45:00', joinedAt: '2022-06-01', permissions: ['members.view', 'care.*', 'followups.view'] },
    { id: 'a-004', name: 'Bro. David Eze', initials: 'DE', email: 'david.e@graceassembly.org', role: 'finance', departments: ['Finance'], status: 'active', lastLogin: '2026-06-08T08:00:00', joinedAt: '2023-01-10', permissions: ['finance.*'] },
    { id: 'a-005', name: 'Sis. Grace Emeka', initials: 'GE', email: 'grace.e@graceassembly.org', role: 'worker', departments: ['Ushering'], status: 'pending', joinedAt: '2026-06-01', permissions: ['members.view', 'followups.view'] },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
    { id: 'n-001', type: 'escalation', title: 'Follow-up Escalated', message: 'Babatunde Fashola has not been contacted in 6 days. Requires urgent attention.', read: false, createdAt: '2026-06-08T14:30:00', link: '/followups', actor: 'System' },
    { id: 'n-002', type: 'finance', title: 'Reconciliation Variance', message: 'June 1 service offering has a ₦15,000 variance. Please investigate.', read: false, createdAt: '2026-06-08T11:00:00', link: '/finance/reconciliation', actor: 'System' },
    { id: 'n-003', type: 'care', title: 'New Care Case', message: 'Sis. Ada Nwosu reported a job loss. Care team should follow up.', read: false, createdAt: '2026-06-08T10:45:00', link: '/care', actor: 'Bro. James' },
    { id: 'n-004', type: 'follow_up', title: 'Members Reached Today', message: 'Bro. Samuel reported 2 new Members Reached at outreach. Auto-follow-ups created.', read: true, createdAt: '2026-06-08T09:15:00', link: '/evangelism', actor: 'Bro. Samuel' },
    { id: 'n-005', type: 'system', title: 'Monthly Report Ready', message: 'May 2026 church operations report is ready for download.', read: true, createdAt: '2026-06-07T08:00:00', actor: 'System' },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const mockActivityFeed: ActivityFeedItem[] = [
    { id: 'af-001', type: 'soul_won', title: 'New Members Reached', description: 'Bro. Samuel won Emeka Dike at the Friday outreach', actor: 'Bro. Samuel', timestamp: '2026-06-08T16:30:00', meta: { count: 1 } },
    { id: 'af-002', type: 'finance', title: 'Service Offering Recorded', description: 'Sunday offering of ₦1,160,000 recorded and banked', actor: 'Bro. Finance', timestamp: '2026-06-08T14:00:00', meta: { amount: 1160000 } },
    { id: 'af-003', type: 'attendance', title: 'Service Attendance Updated', description: '634 members attended Sunday service', actor: 'System', timestamp: '2026-06-08T13:00:00', meta: { count: 634 } },
    { id: 'af-004', type: 'care', title: 'Care Case Opened', description: 'New care case for Bro. Eze Uchenna — hospitalization', actor: 'Sis. Care', timestamp: '2026-06-07T18:00:00' },
    { id: 'af-005', type: 'follow_up', title: 'Follow-up Escalated', description: 'Babatunde Fashola follow-up escalated after 6 days no contact', actor: 'System', timestamp: '2026-06-07T10:00:00' },
    { id: 'af-006', type: 'member_joined', title: 'New Member Registered', description: 'Amaka Ugwu completed membership class and joined the church', actor: 'Pastor Mike', timestamp: '2026-06-06T11:00:00' },
    { id: 'af-007', type: 'department', title: 'Department Updated', description: '3 new members added to Youth Ministry department', actor: 'Bro. David', timestamp: '2026-06-05T15:00:00' },
];

// ─── Simulated API Layer ──────────────────────────────────────────────────────

/**
 * EVENT SIMULATION SYSTEM
 *
 * EVENT: MEMBER_MISSED_SERVICE
 *   → creates FollowUpTask (priority: medium)
 *   → assigns to zone worker
 *   → logs to audit system
 *   → sends notification to assigned worker
 *
 * EVENT: SOUL_WON
 *   → creates FollowUpTask × 5 (weekly cadence)
 *   → assigns to evangelism team leader
 *   → creates EvangelismRecord (stage: soul_won)
 *   → sends notification to leadership
 *
 * EVENT: FINANCE_ENTRY_CREATED
 *   → updates dashboard totals
 *   → triggers reconciliation check
 *   → logs to audit trail
 *
 * EVENT: CARE_CASE_ESCALATED
 *   → sends notification to pastor
 *   → assigns to senior care worker
 *   → adds to escalation queue
 *
 * EVENT: FOLLOW_UP_OVERDUE (> 5 days)
 *   → escalates to supervisor
 *   → sends reminder notification
 *   → changes priority to urgent
 */

// ─── Follow-Up Tasks ──────────────────────────────────────────────────────────

export const mockFollowUpTasks: FollowUpTask[] = [
    { id: 'ft-001', followUpId: 'fu-005', personName: 'Babatunde Fashola', type: 'call', assignedTo: 'Bro. Peter', dueDate: '2026-06-09', priority: 'urgent', status: 'escalated', notes: 'No response after 3 attempts', createdAt: '2026-06-03' },
    { id: 'ft-002', followUpId: 'fu-004', personName: 'Ngozi Okonkwo', type: 'visit', assignedTo: 'Sis. Ruth', dueDate: '2026-06-10', priority: 'high', status: 'pending', notes: 'Schedule home visit after work hours', createdAt: '2026-06-06' },
    { id: 'ft-003', followUpId: 'fu-006', personName: 'Ifeoma Ezeh', type: 'prayer_meeting', assignedTo: 'Sis. Peace', dueDate: '2026-06-11', priority: 'high', status: 'in_progress', notes: 'Family situation needs prayer', createdAt: '2026-06-07' },
    { id: 'ft-004', followUpId: 'fu-001', personName: 'Chukwuemeka Obi', type: 'invite_to_service', assignedTo: 'Bro. Samuel', dueDate: '2026-06-15', priority: 'medium', status: 'pending', createdAt: '2026-06-08' },
    { id: 'ft-005', followUpId: 'fu-008', personName: 'Chidinma Okeke', type: 'call', assignedTo: 'Pastor Mike', dueDate: '2026-06-12', priority: 'medium', status: 'pending', notes: 'Remind about class module 3', createdAt: '2026-06-08' },
];

// ─── Automation Events ────────────────────────────────────────────────────────

export const mockAutomationEvents: AutomationEvent[] = [
    {
        id: 'ae-001',
        type: 'missed_service',
        personName: 'Chukwuemeka Obi',
        triggeredAt: '2026-06-08T20:00:00',
        action: 'Follow-up task created and assigned to Bro. Samuel',
        escalationLevel: 0,
        resolved: false,
    },
    {
        id: 'ae-002',
        type: 'follow_up_overdue',
        personName: 'Babatunde Fashola',
        triggeredAt: '2026-06-07T10:00:00',
        action: 'Escalated to Dept. Head — Deacon Samuel Okafor',
        escalationLevel: 1,
        resolved: false,
    },
    {
        id: 'ae-003',
        type: 'missed_service',
        personName: 'Ifeoma Ezeh',
        triggeredAt: '2026-06-01T20:00:00',
        action: 'Follow-up task created, escalated to Pastor after no resolution',
        escalationLevel: 2,
        resolved: false,
    },
    {
        id: 'ae-004',
        type: 'soul_won',
        personName: 'Emeka Dike',
        triggeredAt: '2026-06-08T16:30:00',
        action: '5-point follow-up schedule auto-generated (Day 1, 3, 7, 14, 30)',
        escalationLevel: 0,
        resolved: true,
    },
    {
        id: 'ae-005',
        type: 'care_escalated',
        personName: 'Bro. Eze Uchenna',
        triggeredAt: '2026-06-07T18:00:00',
        action: 'Care case escalated to Pastor Mike — hospital visit required',
        escalationLevel: 2,
        resolved: false,
    },
];

export const mockApiResponses = {
    'GET /dashboard/metrics': mockDashboardMetrics,
    'GET /followups': mockFollowUpCards,
    'GET /followup-tasks': mockFollowUpTasks,
    'GET /automation-events': mockAutomationEvents,
    'GET /finance/summary': mockFinanceSummary,
    'GET /finance/transactions': mockTransactions,
    'GET /finance/service-offerings': mockServiceOfferings,
    'GET /evangelism/funnel': mockEvangelismFunnelData,
    'GET /evangelism/records': mockEvangelismRecords,
    'GET /members': mockMembers,
    'GET /departments': mockDepartments,
    'GET /care-cases': mockCareCases,
    'GET /admin/users': mockAdminUsers,
    'GET /notifications': mockNotifications,
    'GET /activity-feed': mockActivityFeed,
};

// Utility
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(n: number): string {
    return new Intl.NumberFormat('en-NG').format(n);
}

export function getTrendColor(trend: number): string {
    return trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';
}

export function getTrendIcon(trend: number): string {
    return trend >= 0 ? '↑' : '↓';
}
