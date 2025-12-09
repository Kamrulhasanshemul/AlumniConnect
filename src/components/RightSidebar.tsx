'use client';

import { Search, MapPin, Briefcase } from 'lucide-react';

export default function RightSidebar() {
    return (
        <aside className="hidden lg:block w-80 fixed right-0 top-16 h-[calc(100vh-4rem)] p-6 overflow-y-auto border-l border-gray-100 bg-white/50 backdrop-blur-sm">

            {/* Search */}
            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Search alumni..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-500"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>

            {/* Upcoming Events */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Upcoming Events</h3>
                    <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">See all</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-12 text-center bg-indigo-50 rounded-lg py-1 border border-indigo-100">
                                <span className="block text-xs font-bold text-indigo-600 uppercase">DEC</span>
                                <span className="block text-lg font-bold text-gray-900 leading-none">25</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">Annual Reunion 2025</h4>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span>School Auditorium</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Suggested Connections */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Suggested Alumni</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Alumni Member</h4>
                                    <p className="text-xs text-gray-500 flex items-center">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        Software Eng.
                                    </p>
                                </div>
                            </div>
                            <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors">
                                <span className="text-xs font-bold">+</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                    © 2025 Alumni Connect <br />
                    <span className="hover:underline cursor-pointer">Privacy</span> • <span className="hover:underline cursor-pointer">Terms</span> • <span className="hover:underline cursor-pointer">Cookies</span>
                </p>
            </div>
        </aside>
    );
}
