import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-svh flex bg-background">
            {/* ── Left panel — warm church branding ── */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between bg-primary p-10 relative overflow-hidden">
                {/* Subtle cross/grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }}
                />
                {/* Warm glow orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-400 opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-amber-300 opacity-10 blur-3xl translate-x-1/3 translate-y-1/3" />

                {/* Logo */}
                <Link href={home()} className="relative z-10 flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-sm border border-white/20">
                        G
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">Church OS</p>
                        <p className="text-white/60 text-xs">Grace Assembly</p>
                    </div>
                </Link>

                {/* Center content */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-white text-2xl font-bold leading-snug">
                            The operating system<br />for your church
                        </h2>
                        <p className="text-white/65 text-sm leading-relaxed">
                            Track souls, manage follow-ups, record finances, and care for members — all in one place.
                        </p>
                    </div>

                    {/* Verse */}
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                        <p className="text-white/80 text-xs uppercase tracking-widest font-medium mb-2">
                            Mark 16:15
                        </p>
                        <p className="text-white/90 text-sm leading-relaxed italic">
                            "Go into all the world and preach the gospel to all creation."
                        </p>
                    </div>

                    {/* Testimonial */}
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4">
                        <p className="text-white/75 text-sm leading-relaxed italic">
                            "Church OS transformed how we manage follow-ups. We haven't missed a single soul since."
                        </p>
                        <div className="flex items-center gap-2.5 mt-3">
                            <div className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold">P</div>
                            <div>
                                <p className="text-white text-xs font-medium">Pastor Michael Adeyemi</p>
                                <p className="text-white/50 text-xs">Grace Assembly, Lagos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-white/35 text-xs">
                    © {new Date().getFullYear()} Church OS. Built for the Kingdom.
                </p>
            </div>

            {/* ── Right panel — form ── */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
                {/* Mobile logo */}
                <Link href={home()} className="flex items-center gap-2.5 mb-8 lg:hidden">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">G</div>
                    <span className="font-semibold text-sm">Church OS</span>
                </Link>

                <div className="w-full max-w-sm">
                    <div className="mb-7 space-y-1.5">
                        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
