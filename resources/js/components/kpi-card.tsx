import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

type KpiCardProps = {
    title: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    sparkline?: number[];
    sparklineColor?: string;
    icon: LucideIcon;
    iconColor?: string;
    badge?: string;
    badgeColor?: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
    subtitle?: string;
    className?: string;
    loading?: boolean;
};

const badgeColorMap = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function KpiCard({
    title,
    value,
    trend,
    trendLabel,
    sparkline,
    sparklineColor = 'oklch(0.55 0.18 265)',
    icon: Icon,
    iconColor = 'text-primary',
    badge,
    badgeColor = 'blue',
    subtitle,
    className,
    loading = false,
}: KpiCardProps) {
    const isPositive = trend !== undefined && trend >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    if (loading) {
        return (
            <div className={cn('card-base p-5 animate-pulse', className)}>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="size-9 bg-muted rounded-lg" />
                </div>
                <div className="h-8 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-20 bg-muted rounded" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'card-base card-hover p-5 flex flex-col gap-4 group cursor-default',
                className,
            )}
        >
            {/* Header row */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {title}
                    </span>
                    {badge && (
                        <span className={cn('inline-flex items-center w-fit rounded-md px-2 py-0.5 text-xs font-medium', badgeColorMap[badgeColor])}>
                            {badge}
                        </span>
                    )}
                </div>
                <div className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-smooth group-hover:bg-muted',
                    iconColor,
                )}>
                    <Icon className="size-4" />
                </div>
            </div>

            {/* Value */}
            <div className="flex items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <span className="kpi-value animate-count-up">
                        {value}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-muted-foreground">{subtitle}</span>
                    )}
                    {trend !== undefined && (
                        <div className={cn(
                            'flex items-center gap-1 text-xs font-medium',
                            isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-500 dark:text-red-400',
                        )}>
                            <TrendIcon className="size-3" />
                            <span>{Math.abs(trend)}%</span>
                            {trendLabel && (
                                <span className="text-muted-foreground font-normal">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Sparkline */}
                {sparkline && sparkline.length > 0 && (
                    <div className="w-20 shrink-0 opacity-80 group-hover:opacity-100 transition-smooth">
                        <Sparkline
                            data={sparkline}
                            color={sparklineColor}
                            height={40}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
