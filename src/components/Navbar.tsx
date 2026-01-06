'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Home, User, LogOut, Menu, Bell, MessageSquare, Heart, MessageCircle, Reply, UserPlus, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname === path;

    // Poll for notifications
    useEffect(() => {
        if (!session) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                    setUnreadCount(data.filter((n: any) => !n.read).length);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [session]);

    const markRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications', { method: 'PUT' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { }
    };

    const toggleNotifications = () => {
        const newState = !showNotifications;
        setShowNotifications(newState);
        if (newState) markRead();
    };

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart className="w-4 h-4 text-pink-500 fill-current" />;
            case 'COMMENT': return <MessageCircle className="w-4 h-4 text-indigo-500 fill-current" />;
            case 'CONNECTION_REQUEST': return <UserPlus className="w-4 h-4 text-blue-500" />;
            case 'CONNECTION_ACCEPTED': return <Check className="w-4 h-4 text-green-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                A
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:block">
                                AlumniConnect
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {session && (
                        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
                            <Link
                                href="/dashboard"
                                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/dashboard')
                                    ? 'text-indigo-600 bg-indigo-50 shadow-sm shadow-indigo-100'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Home className={`w-4 h-4 ${isActive('/dashboard') ? 'fill-current' : ''}`} />
                                <span>Home</span>
                            </Link>

                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            {/* Notification Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={toggleNotifications}
                                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div key={n.id} className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                                            {n.actor?.profilePhoto ? (
                                                                <img src={n.actor.profilePhoto} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{n.actor?.name?.[0]}</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-800">
                                                                <span className="font-bold">{n.actor?.name}</span>
                                                                <span className="text-gray-600"> {n.type === 'LIKE' ? 'liked your post' : 'commented on your post'}</span>
                                                            </p>
                                                            {n.post?.content && (
                                                                <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">"{n.post.content}"</p>
                                                            )}
                                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                        <div className="ml-auto mt-1">
                                                            {getIcon(n.type)}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href="/messages">
                                <button className={`p-2 rounded-full transition-colors relative ${isActive('/messages') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                            </Link>

                            <div className="h-6 w-px bg-gray-200 mx-2"></div>

                            {/* Profile */}
                            <div className="flex items-center gap-3 pl-2">
                                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200">
                                        {session.user?.image ? (
                                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-indigo-700">{session.user?.name?.[0]}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden lg:block">
                                        {session.user?.name}
                                    </span>
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && session && (
                <div className="md:hidden glass border-t border-gray-100 animate-in slide-in-from-top-2">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
                        <Link href="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Messages</Link>
                        <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Profile</Link>
                        <button onClick={() => signOut()} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Sign Out</button>
                    </div>
                </div>
            )}
        </nav>
    );
}
