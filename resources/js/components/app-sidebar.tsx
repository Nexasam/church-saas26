import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    CreditCard,
    Heart,
    LayoutDashboard,
    LayoutGrid,
    MessageSquare,
    Settings,
    Shield,
    TrendingUp,
    Users,
    UserSearch,
    Crown,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    // {
    //     title: 'Follow-Ups',
    //     href: '/followups',
    //     icon: UserSearch,
    // },
    {
        title: 'Evangelism',
        href: '/evangelism',
        icon: TrendingUp,
    },
    {
        title: 'Finance',
        href: '/finance',
        icon: CreditCard,
    },
    {
        title: 'Members',
        href: '/members',
        icon: Users,
    },
    {
        title: 'Departments',
        href: '/departments',
        icon: LayoutGrid,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarDays,
    },
    {
        title: 'Love System',
        href: '/love',
        icon: Heart,
    },
    {
        title: 'SMS',
        href: '/sms',
        icon: MessageSquare,
    },
    {
        title: 'Worker Portal',
        href: '/worker/dashboard',
        icon: Crown,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin',
        href: '/admin',
        icon: Shield,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: CreditCard,
    },
];

export function AppSidebar() {
    const { auth, church } = usePage().props as any;
    const user = auth?.user;
    const churchName = church?.name ?? 'My Church';

    // Check if user is an admin (not a regular member role)
    const isAdmin = user?.is_super_admin || (user?.role && user.role.slug !== 'member' && user.role.slug !== 'finance');
    const isFinanceOfficer = user?.role?.slug === 'finance';

    // Filter navigation based on user role
    const filteredMainNavItems = isAdmin
        ? mainNavItems.filter(item => item.href !== '/worker/dashboard')
        : isFinanceOfficer
        ? [
            {
                title: 'Finance Portal',
                href: '/finance-portal',
                icon: Wallet,
            },
            {
                title: 'Finance',
                href: '/finance',
                icon: CreditCard,
            },
            {
                title: 'Notifications',
                href: '/notifications',
                icon: MessageSquare,
            },
          ]
        : [
            {
                title: 'My Departments',
                href: '/worker/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Notifications',
                href: '/notifications',
                icon: MessageSquare,
            },
          ];

    const filteredAdminNavItems = isAdmin ? adminNavItems : isFinanceOfficer
        ? [{ title: 'Settings', href: '/settings/profile', icon: Settings }]
        : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header — Church Name */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip={{ children: churchName }}
                        >
                            <Link href={isAdmin ? dashboard() : isFinanceOfficer ? '/finance-portal' : '/worker/dashboard'} className="flex items-center gap-2 w-full">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent>
                <NavMain items={filteredMainNavItems} label={isAdmin ? "Platform" : isFinanceOfficer ? "Finance" : "My Portal"} />
                {(isAdmin || isFinanceOfficer) && <SidebarSeparator className="mx-2" />}
                {(isAdmin || isFinanceOfficer) && <NavMain items={filteredAdminNavItems} label="Administration" />}
            </SidebarContent>

            {/* Footer — User Profile */}
            <SidebarFooter>
                <NavFooter items={[]} className="hidden" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
