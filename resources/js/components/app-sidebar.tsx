import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    CreditCard,
    HeartHandshake,
    LayoutDashboard,
    LayoutGrid,
    MessageSquare,
    Settings,
    Shield,
    TrendingUp,
    Users,
    UserSearch,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { mockTenants } from '@/lib/mock-data';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Follow-Ups',
        href: '/followups',
        icon: UserSearch,
    },
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
        title: 'Care Cases',
        href: '/care',
        icon: HeartHandshake,
    },
    {
        title: 'SMS',
        href: '/sms',
        icon: MessageSquare,
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
    const currentTenant = mockTenants[0];

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Header — Church Switcher */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    tooltip={{ children: currentTenant.name }}
                                >
                                    <Link href={dashboard()} className="flex items-center gap-2 w-full">
                                        <AppLogo />
                                    </Link>
                                    <ChevronDown className="ml-auto size-4 opacity-50 shrink-0" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="bottom"
                                align="start"
                                className="w-64"
                            >
                                <div className="px-2 py-1.5">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        Switch Church
                                    </p>
                                </div>
                                <DropdownMenuSeparator />
                                {mockTenants.map((tenant) => (
                                    <DropdownMenuItem
                                        key={tenant.id}
                                        className="flex items-start gap-3 py-2.5 cursor-pointer"
                                    >
                                        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0">
                                            {tenant.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">{tenant.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">{tenant.branch} · {tenant.memberCount} members</span>
                                        </div>
                                        {tenant.id === currentTenant.id && (
                                            <div className="ml-auto size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-muted-foreground">
                                    <Building2 className="size-4" />
                                    Add new church
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Main Navigation */}
            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
                <SidebarSeparator className="mx-2" />
                <NavMain items={adminNavItems} label="Administration" />
            </SidebarContent>

            {/* Footer — User Profile */}
            <SidebarFooter>
                <NavFooter items={[]} className="hidden" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
