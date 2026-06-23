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
    ArrowLeft,
    Mail,
    Phone,
    UserPlus,
    MoreHorizontal,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function WorkerDepartment() {
    const { department, members, current_worker } = usePage().props as any;

    const IconComponent = iconMap[department.icon] || Users;
    const c = colorMap[department.color] || colorMap.blue;

    return (
        <>
            <Head title={`${department.name} - Worker Portal`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Department Members
                            </h2>
                            <Badge variant="outline">{members.length} members</Badge>
                        </div>
                        
                        <div className="space-y-3">
                            {members.map((member: any) => (
                                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                        {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                                            {member.role === 'leader' && (
                                                <Badge className="gap-1 bg-amber-100 text-amber-700 text-xs">
                                                    <Crown className="w-3 h-3" />
                                                    Leader
                                                </Badge>
                                            )}
                                            {member.role === 'worker' && (
                                                <Badge variant="outline" className="text-xs">
                                                    Worker
                                                </Badge>
                                            )}
                                            {!member.is_active && (
                                                <Badge variant="outline" className="text-xs">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                            {member.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {member.phone}
                                                </span>
                                            )}
                                            {member.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {members.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                                    No members in this department
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Department Info */}
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-gray-900 dark:text-white">{department.description || 'No description'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department Leader</p>
                                <p className="text-gray-900 dark:text-white">{department.leader || 'Not assigned'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
