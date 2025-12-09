'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    UserPlus,
    MessageSquare,
    TrendingUp,
    MoreVertical
} from 'lucide-react';

interface DashboardStats {
    stats: {
        totalUsers: number;
        pendingUsers: number;
        totalPosts: number;
        totalBatches: number;
    };
    recentUsers: any[];
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
    );

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, {session?.user?.name}. Here's what's happening today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Alumni"
                    value={data?.stats?.totalUsers || 0}
                    icon={Users}
                    color="bg-blue-500"
                    trend="+12%"
                />
                <StatCard
                    title="Pending Requests"
                    value={data?.stats?.pendingUsers || 0}
                    icon={UserPlus}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Total Posts"
                    value={data?.stats?.totalPosts || 0}
                    icon={MessageSquare}
                    color="bg-purple-500"
                    trend="+5%"
                />
                <StatCard
                    title="Active Batches"
                    value={data?.stats?.totalBatches || 0}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                />
            </div>

            {/* Recent Activity / Growth */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Recent Registrations</h3>
                        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Batch</th>
                                    <th className="pb-3">Joined</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.recentUsers?.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-sm text-gray-600">{user.passingYear}</td>
                                        <td className="py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">Active</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Top Performing Batches</h3>
                    <div className="space-y-6">
                        {[
                            { year: 2015, count: 145, percentage: 85 },
                            { year: 2018, count: 98, percentage: 65 },
                            { year: 2012, count: 76, percentage: 45 },
                        ].map((batch) => (
                            <div key={batch.year}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-700 text-sm">Batch {batch.year}</span>
                                    <span className="text-xs text-gray-500">{batch.count} Members</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${batch.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
