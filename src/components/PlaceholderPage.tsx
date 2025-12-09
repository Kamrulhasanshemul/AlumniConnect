'use client';

import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <Sidebar />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 pb-20">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-[500px] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                <Icon className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                            <p className="text-gray-500 max-w-md mx-auto">{description}</p>
                            <span className="inline-block mt-6 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full">
                                Coming Soon
                            </span>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <RightSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
