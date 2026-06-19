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
    accent?: string;
    badge?: string;
    badgeColor?: 'green' | 'red' | 'amber' | 'blue' | 'purple';
    subtitle?: string;
    className?: string;
    loading?: boolean;
};

export function KpiCard({
    title,
    value,
    trend,
    trendLabel,
    sparkline,
    sparklineColor = 'oklch(0.55 0.18 265)',
    icon: Icon,
    badge,
    badgeColor = 'blue',
    subtitle,
    className,
    loading = false,
}: KpiCardProps) {
    const isPositive = trend !== undefined && trend >= 0;
    const TrendIcon  = isPositive ? TrendingUp : TrendingDown;

    // Scale value font size based on string length to prevent overflow
    const strLen   = String(value).length;
    const valueSize = strLen > 12 ? 'text-base'
                    : strLen > 9  ? 'text-lg'
                    : strLen > 6  ? 'text-xl'
                    : 'text-2xl';

    if (loading) {
        return (
            <div className={cn('h-36 rounded-xl border border-border bg-card p-4 animate-pulse flex flex-col justify-between', className)}>
                <div className="h-2.5 w-20 bg-muted rounded" />
                <div className="h-7 w-24 bg-muted rounded" />
                <div className="h-2 w-16 bg-muted rounded" />
            </div>
        );
    }

    return (
        <div className={cn(
            'relative h-36 overflow-hidden rounded-xl border border-border bg-card',
            'hover:border-border/70 hover:shadow-sm transition-all duration-150',
            className,
        )}>
            {/* Sparkline watermark */}
            {sparkline && sparkline.length > 0 && (
                <div className="pointer-events-none absolute bottom-0 right-0 w-20 h-10 opacity-[0.07]">
                    <Sparkline data={sparkline} color={sparklineColor} height={40} />
                </div>
            )}

            <div className="relative h-full flex flex-col justify-between p-4">

                {/* Top row: title + icon */}
                <div className="flex items-start justify-between gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight max-w-[70%]">
                        {title}
                    </p>
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                        <Icon className="size-3.5" />
                    </div>
                </div>

                {/* Middle: badge (optional) + value + subtitle */}
                <div className="flex flex-col gap-0.5">
                    {badge && (
                        <span className={cn(
                            'self-start text-[9px] font-bold rounded-full px-1.5 py-0.5 mb-0.5 whitespace-nowrap',
                            badgeColor === 'red'    && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            badgeColor === 'green'  && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                            badgeColor === 'amber'  && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            badgeColor === 'blue'   && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                            badgeColor === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                        )}>
                            {badge}
                        </span>
                    )}
                    <p className={cn('font-bold tracking-tight leading-none tabular-nums text-foreground', valueSize)}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Bottom row: trend only */}
                <div>
                    {trend !== undefined && (
                        <div className={cn(
                            'flex items-center gap-0.5 text-[10px] font-semibold',
                            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
                        )}>
                            <TrendIcon className="size-2.5 shrink-0" />
                            <span>{Math.abs(trend)}%</span>
                            {trendLabel && (
                                <span className="font-normal text-muted-foreground ml-0.5 truncate">{trendLabel}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
