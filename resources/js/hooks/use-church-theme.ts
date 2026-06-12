import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type SharedProps = {
    church?: {
        theme_color?: string;
    } | null;
};

/**
 * Reads the church theme_color from shared Inertia props and
 * applies it as data-theme on <html> — keeping CSS vars in sync
 * without a full page reload.
 */
export function useChurchTheme() {
    const { church } = usePage<SharedProps>().props;
    const theme = church?.theme_color ?? 'blue';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return theme;
}
