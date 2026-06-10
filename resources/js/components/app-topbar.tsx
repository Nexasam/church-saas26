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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { mockNotifications, mockMembers } from '@/lib/mock-data';
import { useInitials } from '@/hooks/use-initials';
import { UserMenuContent } from '@/components/user-menu-content';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { User } from '@/types';

const quickActions = [
    { label: 'Add Member', href: '/members/create', icon: Users },
    { label: 'Record Follow-Up', href: '/followups/create', icon: UserSearch },
    { label: 'Log Finance Entry', href: '/finance/create', icon: CreditCard },
    { label: 'Log Soul Won', href: '/evangelism/create', icon: TrendingUp },
    { label: 'Open Care Case', href: '/care/create', icon: HeartHandshake },
];

export function AppTopBar() {
    const { auth } = usePage().props as { auth: { user: User } };
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const getInitials = useInitials();

    const unreadCount = mockNotifications.filter((n) => !n.read).length;

    const filteredMembers = searchQuery.length > 1
        ? mockMembers.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone?.includes(searchQuery),
          ).slice(0, 5)
        : [];

    const notifTypeColor: Record<string, string> = {
        follow_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
        finance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
        system: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        care: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
        escalation: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    };

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
                {/* Quick Create */}
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

                <Separator orientation="vertical" className="h-5 mx-1" />

                {/* Notifications */}
                <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
                    <SheetTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                    <Bell className="size-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Notifications</TooltipContent>
                        </Tooltip>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-96 p-0 flex flex-col">
                        <SheetHeader className="px-4 py-3.5 border-b border-border">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-base font-semibold">Notifications</SheetTitle>
                                {unreadCount > 0 && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground">
                                        <CheckCheck className="size-3.5" />
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </SheetHeader>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
                            {mockNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        'flex gap-3 px-4 py-3.5 hover:bg-muted/40 transition-base cursor-pointer',
                                        !notif.read && 'bg-primary/[0.03]',
                                    )}
                                >
                                    <div className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold capitalize', notifTypeColor[notif.type])}>
                                        {notif.type.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn('text-sm font-medium leading-snug', !notif.read && 'text-foreground')}>{notif.title}</p>
                                            {!notif.read && <div className="size-2 shrink-0 rounded-full bg-primary mt-1.5" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                                            {new Date(notif.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border p-3">
                            <Button variant="ghost" className="w-full text-sm text-muted-foreground h-8">
                                View all notifications
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

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
