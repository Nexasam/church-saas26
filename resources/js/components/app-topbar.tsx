import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CheckCheck,
    ChevronDown,
    CreditCard,
    HeartHandshake,
    LayoutDashboard,
    Plus,
    Search,
    TrendingUp,
    Users,
    UserSearch,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { mockMembers } from '@/lib/mock-data';
import { useInitials } from '@/hooks/use-initials';
import { UserMenuContent } from '@/components/user-menu-content';
import { NotificationBadge } from '@/components/notification-badge';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { User } from '@/types';

const quickActions = [
    { label: 'Add Member', href: '/members?create=1', icon: Users },
    { label: 'Record Follow-Up', href: '/followups', icon: UserSearch },
    { label: 'Log Finance Entry', href: '/finance', icon: CreditCard },
    { label: 'Log Members Reached', href: '/evangelism', icon: TrendingUp },
    { label: 'Open Care Case', href: '/care', icon: HeartHandshake },
];

export function AppTopBar() {
    const { auth } = usePage().props as { auth: { user: User } };
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const getInitials = useInitials();

    const isAdmin = auth?.user?.is_super_admin ||
        (auth?.user?.role && auth.user.role.slug !== 'member' && auth.user.role.slug !== 'worker');

    const filteredMembers = searchQuery.length > 1
        ? mockMembers.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone?.includes(searchQuery),
          ).slice(0, 5)
        : [];

    return (
        <div className="flex items-center gap-3 w-full">
            {/* Global Search */}
            <div className="relative flex-1 max-w-md">
                {searchOpen ? (
                    <div className="flex items-center gap-2 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                autoFocus
                                className="h-8 pl-8 pr-8 text-sm bg-muted/50 border-transparent focus:border-border focus:bg-background"
                                placeholder="Search members, transactions, tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        >
                            Cancel
                        </Button>
                        {/* Search Results Dropdown */}
                        {searchQuery.length > 1 && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-md z-50 overflow-hidden">
                                {filteredMembers.length > 0 ? (
                                    <div className="p-1">
                                        <p className="px-2 py-1 text-xs text-muted-foreground font-medium">Members</p>
                                        {filteredMembers.map((m) => (
                                            <Link
                                                key={m.id}
                                                href={`/members/${m.id}`}
                                                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-sm transition-base"
                                                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                            >
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                    {m.initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{m.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{m.phone}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                        No results for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 h-8 px-3 rounded-md text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-base border border-transparent hover:border-border w-full max-w-xs"
                    >
                        <Search className="size-4 shrink-0" />
                        <span>Search...</span>
                        <kbd className="ml-auto text-xs bg-background/80 border border-border rounded px-1 py-0.5 font-mono hidden sm:block">
                            ⌘K
                        </kbd>
                    </button>
                )}
            </div>

            <div className="ml-auto flex items-center gap-1">
                {/* Quick Create — admin only */}
                {isAdmin && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="h-8 gap-1.5">
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Create</span>
                            <ChevronDown className="size-3 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {quickActions.map((action) => (
                            <DropdownMenuItem key={action.href} asChild>
                                <Link href={action.href} className="flex items-center gap-2.5">
                                    <action.icon className="size-4 text-muted-foreground" />
                                    {action.label}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                )}

                {isAdmin && <Separator orientation="vertical" className="h-5 mx-1" />}

                {/* Notifications */}
                <div className="relative">
                    <div onClick={() => setNotifOpen(!notifOpen)}>
                        <NotificationBadge />
                    </div>
                    {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                            <Avatar className="size-7">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                    {auth?.user ? getInitials(auth.user.name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {auth?.user && <UserMenuContent user={auth.user} />}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
