'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import { useRouter } from 'next/navigation';
import {
    MapPin,
    Briefcase,
    Mail,
    Phone,
    UserPlus,
    MessageSquare,
    Check,
    X,
    Grid,
    Users,
    Clock,
    Heart,
    Share2,
    MoreHorizontal
} from 'lucide-react';

export default function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState<any>(null); // PENDING, ACCEPTED, or null
    const [posts, setPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [actionLoading, setActionLoading] = useState(false);

    const isMe = session?.user?.id === id;

    useEffect(() => {
        if (isMe) {
            router.replace('/profile');
            return;
        }
        fetchProfile();
        fetchConnectionStatus();
        fetchPosts();
    }, [id, session]);

    const fetchProfile = async () => {
        try {
            // We need a public API for fetching user by ID, reuse dashboard logic or create new
            // For now, let's assume we can fetch basic user info. 
            // Actually, we haven't created a dedicated "get user by ID" API.
            // But we can create a simple server action or route.
            // Let's create `src/app/api/users/[id]/route.ts` quickly or inline it.
            // Wait, we don't have that yet. I'll create the route in a moment.
            // For now, I'll assume it exists.
            const res = await fetch(`/api/users/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchConnectionStatus = async () => {
        if (!session) return;
        try {
            const res = await fetch(`/api/connections/${id}`);
            if (res.ok) {
                const data = await res.json();
                setConnection(data); // null or object
            }
        } catch (error) { console.error(error); }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch(`/api/posts?userId=${id}`);
            if (res.ok) {
                setPosts(await res.json());
            }
        } catch (e) { }
    };

    const handleConnect = async () => {
        if (!session) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addresseeId: id })
            });
            if (res.ok) {
                const data = await res.json();
                setConnection(data);
            }
        } catch (error) { alert('Error sending request'); }
        finally { setActionLoading(false); }
    };

    const handleAccept = async () => {
        if (!connection) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/connections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: connection.id, action: 'ACCEPT' })
            });
            if (res.ok) {
                setConnection({ ...connection, status: 'ACCEPTED' });
            }
        } catch (error) { alert('Error accepting'); }
        finally { setActionLoading(false); }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!profile) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">User not found</h2>
                <button onClick={() => router.back()} className="text-indigo-600 hover:underline mt-2">Go Back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="hidden lg:block lg:col-span-1"><Sidebar /></div>

                    <div className="lg:col-span-2 space-y-6 pb-20">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-48 bg-gradient-to-r from-gray-400 to-gray-600 relative"></div>
                            <div className="px-6 pb-6 relative">
                                <div className="flex justify-between items-end -mt-16 mb-6">
                                    <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 text-4xl">
                                            {profile.profilePhoto ? (
                                                <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>👤</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mb-2">
                                        {/* Action Buttons */}
                                        {connection?.status === 'ACCEPTED' ? (
                                            <>
                                                <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-default">
                                                    <Check className="w-4 h-4" />
                                                    Connected
                                                </button>
                                                <button onClick={() => router.push('/messages')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message
                                                </button>
                                            </>
                                        ) : connection?.status === 'PENDING' ? (
                                            connection.requesterId === session?.user?.id ? (
                                                <button disabled className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-not-allowed">
                                                    <Clock className="w-4 h-4" />
                                                    Request Sent
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={handleAccept} disabled={actionLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                                                        Accept Request
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <button
                                                onClick={handleConnect}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Connect
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-left mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {profile.name}
                                        <div className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                            Batch {profile.passingYear}
                                        </div>
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1 max-w-lg">
                                        {profile.bio || 'Alumni Member'}
                                    </p>

                                    <div className="flex flex-wrap gap-y-2 gap-x-6 mt-4 text-sm text-gray-600">
                                        {profile.occupation && (
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="w-4 h-4 text-gray-400" />
                                                <span>{profile.occupation}</span>
                                            </div>
                                        )}
                                        {profile.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex border-t border-gray-100 pt-1">
                                    <button onClick={() => setActiveTab('posts')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Posts</button>
                                    <button onClick={() => setActiveTab('about')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'about' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>About</button>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                {posts.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                                        <Grid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No visible posts.</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <article key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 p-0.5 border border-white shadow-sm overflow-hidden">
                                                        {post.user.profilePhoto ? (
                                                            <img src={post.user.profilePhoto} className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <div className="w-full h-full bg-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                                {post.user.name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm">{post.user.name}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                            {post.visibility === 'batch' && <span className="bg-gray-100 px-1.5 py-0.5 rounded">🔒 Batch</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-800 mb-6 text-[15px] leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </p>

                                            <div className="flex items-center gap-1 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500">
                                                    <Heart className={`w-4 h-4 ${post.likes.includes(session?.user?.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                                                    <span className="text-sm font-semibold">{post.likes.length}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        )}

                    </div>
                    <div className="hidden lg:block lg:col-span-1"><RightSidebar /></div>
                </div>
            </div>
        </div>
    );
}
