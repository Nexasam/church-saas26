import { Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Settings,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/platform',          label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/platform/settings', label: 'Settings',   icon: Settings },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const { auth } = usePage<{ auth: { user: { name: string; email: string } } }>().props;

    // Impersonation banner
    const isImpersonating = typeof window !== 'undefined' && document.cookie.includes('impersonating');

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-60 shrink-0 border-r border-border flex flex-col bg-card">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                        G
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Church OS</p>
                        <p className="text-xs text-muted-foreground">Platform Admin</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 flex flex-col gap-0.5">
                    {navItems.map(item => {
                        const Icon    = item.icon;
                        const isActive = url.startsWith(item.href) && (item.href !== '/platform' || url === '/platform');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="border-t border-border p-3">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {auth?.user?.name?.charAt(0) ?? 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{auth?.user?.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{auth?.user?.email}</p>
                        </div>
                        <button
                            onClick={() => router.post('/logout')}
                            className="text-muted-foreground hover:text-foreground"
                            title="Sign out"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Impersonation banner */}
                <div className="flex items-center justify-between bg-amber-500 text-white px-6 py-2 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <Shield className="size-3.5" />
                        Platform Admin Mode
                    </div>
                    <Link href="/platform" className="flex items-center gap-1 hover:underline">
                        Platform Dashboard <ChevronRight className="size-3" />
                    </Link>
                </div>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
