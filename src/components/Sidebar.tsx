'use client';

import {
    Home,
    User,
    Calendar,
    Users,
    MessageCircle,
    Bookmark,
    Settings,
    Briefcase,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: 'Feed', href: '/dashboard' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Users, label: 'Batchmates', href: '/batch' },
        { icon: Briefcase, label: 'Jobs', href: '/jobs' },
        { icon: Calendar, label: 'Events', href: '/events' },
        { icon: Bookmark, label: 'Saved', href: '/saved' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <aside className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] p-6 overflow-y-auto z-40 bg-transparent">
            {/* Quick Actions / Stats could go here later */}

            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-white shadow-md text-indigo-600 font-semibold scale-105'
                                : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shortcuts</p>
                <div className="space-y-2">
                    <button className="flex items-center space-x-3 text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 hover:bg-white/60 rounded-xl w-full text-left transition-all">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">15</span>
                        <span className="font-medium">Batch of 2015</span>
                    </button>
                    <button className="flex items-center space-x-3 text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 hover:bg-white/60 rounded-xl w-full text-left transition-all">
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">DC</span>
                        <span className="font-medium">Dhaka Chapter</span>
                    </button>
                </div>
            </div>

            {/* Premium / Upgrade Card style placeholder */}
            <div className="mt-8 mx-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <Zap className="w-5 h-5 text-yellow-300" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">Coming Soon</h3>
                    <p className="text-xs text-indigo-100 leading-relaxed opacity-90">
                        Mentor matching and exclusive events.
                    </p>
                </div>
            </div>
        </aside>
    );
}
