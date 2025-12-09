'use client';

import {
    Home,
    User,
    Calendar,
    Users,
    MessageCircle,
    Bookmark,
    Settings,
    Briefcase
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
        <aside className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] p-4 overflow-y-auto">
            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 px-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Groups</p>
                <div className="space-y-2">
                    <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors w-full text-left">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span>Batch of 2015</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors w-full text-left">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Dhaka Chapter</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors w-full text-left">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span>Football Club</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
