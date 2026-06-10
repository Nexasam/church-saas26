import { mockTenants } from '@/lib/mock-data';

export default function AppLogo() {
    const church = mockTenants[0];

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {church.name.charAt(0)}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                    {church.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {church.branch}
                </span>
            </div>
        </>
    );
}
