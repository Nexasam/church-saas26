import { cn } from '@/lib/utils';

type SparklineProps = {
    data: number[];
    className?: string;
    color?: string;
    height?: number;
    filled?: boolean;
};

export function Sparkline({ data, className, color = 'currentColor', height = 36, filled = true }: SparklineProps) {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const padY = 2;

    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - padY - ((v - min) / range) * (height - padY * 2);
        return `${x},${y}`;
    });

    const polyline = points.join(' ');
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const fillPath = `M${firstPoint} L${polyline.replace(`${firstPoint} `, '')} L${width},${height} L0,${height} Z`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            className={cn('overflow-visible', className)}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id={`spark-fill-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {filled && (
                <path
                    d={fillPath}
                    fill={`url(#spark-fill-${color.replace(/[^a-z0-9]/gi, '')})`}
                />
            )}
            <polyline
                points={polyline}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {lastPoint && (
                <circle
                    cx={lastPoint.split(',')[0]}
                    cy={lastPoint.split(',')[1]}
                    r="2.5"
                    fill={color}
                />
            )}
        </svg>
    );
}
