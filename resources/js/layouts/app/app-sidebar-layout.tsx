import { router, usePage } from '@inertiajs/react';
import { LogOut, Shield } from 'lucide-react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { impersonating, church } = usePage<{ impersonating?: boolean; church?: { name?: string } }>().props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {/* Impersonation banner — shown when platform admin is viewing as a church */}
                {impersonating && (
                    <div className="flex items-center justify-between bg-amber-500 text-white px-5 py-2 text-xs font-semibold shrink-0 z-50">
                        <div className="flex items-center gap-2">
                            <Shield className="size-3.5" />
                            Viewing as: <span className="font-bold">{church?.name ?? 'Church'}</span>
                            <span className="opacity-70 font-normal">— Platform Admin Mode</span>
                        </div>
                        <button
                            onClick={() => router.post('/platform/stop-impersonating')}
                            className="flex items-center gap-1.5 rounded-md bg-white/20 hover:bg-white/30 px-3 py-1 transition-colors font-semibold"
                        >
                            <LogOut className="size-3.5" />
                            Exit &amp; Return to Platform Admin
                        </button>
                    </div>
                )}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
