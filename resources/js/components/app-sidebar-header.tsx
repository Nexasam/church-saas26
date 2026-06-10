import { AppTopBar } from '@/components/app-topbar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex flex-col shrink-0 border-b border-sidebar-border/50">
            {/* Top row: sidebar trigger + top bar */}
            <div className="flex items-center h-14 px-3 gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <Separator orientation="vertical" className="h-4 mx-1" />
                {/* TopBar fills the remaining width */}
                <div className="flex-1 min-w-0">
                    <AppTopBar />
                </div>
            </div>

            {/* Breadcrumbs row */}
            {breadcrumbs.length > 1 && (
                <div className="flex items-center h-9 px-4 border-t border-sidebar-border/30">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            )}
        </header>
    );
}
