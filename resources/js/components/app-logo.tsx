import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { church } = usePage().props as any;
    const name = church?.name ?? 'Church OS';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
                {name.charAt(0)}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                    {name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Main Campus
                </span>
            </div>
        </>
    );
}
