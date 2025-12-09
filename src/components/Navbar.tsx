'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                Alumni<span className="text-indigo-600">Connect</span>
                            </span>
                        </Link>
                    </div>

                    {/* Centered Desktop Navigation - simplified for now, will be moved to Sidebar in layout strategy but keeping here for mobile/transition */}
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <NavLink href="/dashboard" active={isActive('/dashboard')}>Feed</NavLink>
                        <NavLink href="/profile" active={isActive('/profile')}>Profile</NavLink>
                        {session.user.role === 'admin' && (
                            <NavLink href="/admin" active={isActive('/admin')}>Admin</NavLink>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center space-x-3">
                            <span className="text-gray-700 text-sm font-medium">{session.user.name}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/signin' })}
                                className="text-gray-500 hover:text-red-600 px-3 py-1.5 text-sm font-medium transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
        >
            {children}
        </Link>
    );
}
