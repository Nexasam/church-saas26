import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    Music,
    Heart,
    Monitor,
    Globe,
    Star,
    Shield,
    Zap,
    LayoutGrid,
    Crown,
    User,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
    Users,
    Music,
    Heart,
    Monitor,
    Globe,
    Star,
    Shield,
    Zap,
    LayoutGrid,
};

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600 dark:text-purple-400' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600 dark:text-pink-400' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', icon: 'text-rose-600 dark:text-rose-400' },
    slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', icon: 'text-slate-600 dark:text-slate-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-600 dark:text-yellow-400' },
};

export default function WorkerDashboard() {
    const { departments, user } = usePage().props as any;

    return (
        <>
            <Head title="Worker Portal" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Departments</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            You are assigned to {departments.length} department{departments.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Department Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept: any) => {
                            const IconComponent = iconMap[dept.icon] || Users;
                            const c = colorMap[dept.color] || colorMap.blue;
                            
                            return (
                                <Link
                                    key={dept.id}
                                    href={`/worker/department/${dept.id}`}
                                    className="group"
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn('flex size-12 items-center justify-center rounded-xl border', c.bg, c.border)}>
                                                <IconComponent className={cn('size-6', c.icon)} />
                                            </div>
                                            {dept.is_leader && (
                                                <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200">
                                                    <Crown className="w-3 h-3" />
                                                    Leader
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {dept.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                            {dept.description || 'No description'}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Users className="w-4 h-4" />
                                                <span>{dept.member_count} members</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {dept.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {departments.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No Departments Assigned
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                You haven't been assigned to any departments yet. Contact your administrator.
                            </p>
                            <Link href="/dashboard">
                                <Button variant="outline">Return to Dashboard</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
