import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );

        const component = (page as any).default;
        const layoutConfig = component?.layout;

        // Only wrap in AppLayout when the layout config has `breadcrumbs`
        // (auth pages use { title, description } — those must NOT get AppLayout)
        if (
            layoutConfig &&
            typeof layoutConfig === 'object' &&
            !Array.isArray(layoutConfig) &&
            typeof layoutConfig !== 'function' &&
            'breadcrumbs' in layoutConfig
        ) {
            const breadcrumbs: BreadcrumbItem[] = layoutConfig.breadcrumbs ?? [];

            if (name.startsWith('settings/')) {
                component.layout = (page: React.ReactNode) => (
                    <AppLayout breadcrumbs={breadcrumbs}>
                        <SettingsLayout>{page}</SettingsLayout>
                    </AppLayout>
                );
            } else {
                component.layout = (page: React.ReactNode) => (
                    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
                );
            }
        }

        // Auth pages have { title, description } layout config — apply AuthLayout
        // Only do this when the layout is still a plain object (not yet a function)
        if (
            name.startsWith('auth/') &&
            layoutConfig &&
            typeof layoutConfig === 'object' &&
            typeof layoutConfig !== 'function'
        ) {
            component.layout = (page: React.ReactNode) => (
                <AuthLayout>{page}</AuthLayout>
            );
        }

        // Pages with no layout at all
        if (!component?.layout) {
            if (name === 'welcome') {
                // no layout
            } else if (name.startsWith('auth/')) {
                component.layout = (page: React.ReactNode) => (
                    <AuthLayout>{page}</AuthLayout>
                );
            }
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'oklch(0.55 0.18 265)',
    },
});

initializeTheme();
