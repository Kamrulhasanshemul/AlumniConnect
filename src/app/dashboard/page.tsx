'use client';


import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Image as ImageIcon,
    Smile,
    Send,
    MapPin,
    SmilePlus
} from 'lucide-react';

interface Post {
    id: string;
    user: {
        id: string;
        name: string;
        profilePhoto?: string;
        passingYear: number;
    };
    content: string;
    likes: string[];
    comments: any[];
    visibility: 'public' | 'batch';
    createdAt: string;
}

export default function Dashboard() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'batch'>('public');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const [commenting, setCommenting] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts', { cache: 'no-store' });
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setPosting(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, visibility }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message);
                return;
            }

            await fetchPosts();
            setContent('');
        } catch (error) {
            alert('Failed to post');
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            const data = await res.json();

            setPosts(posts.map(p => {
                if (p.id === postId) {
                    const userId = session?.user?.id || '';
                    const newLikes = data.isLiked
                        ? [...p.likes, userId]
                        : p.likes.filter(id => id !== userId);
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
            // Background refresh to sync state
            fetchPosts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText }),
            });

            if (!res.ok) throw new Error('Failed to comment');

            const updatedPost = await res.json();
            setPosts(posts.map(p => p.id === postId ? updatedPost : p));
            setCommentText('');
            // Keep comment section open? Maybe close it or keep it.
            // setCommenting(null); 
            fetchPosts();
        } catch (error) {
            console.error(error);
            alert('Failed to add comment');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar Spacer - since Sidebar is fixed, this column holds the space */}
                    <div className="hidden lg:block lg:col-span-1">
                        <Sidebar />
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Composer Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white/50 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 p-0.5 flex-shrink-0">
                                    <div className="w-full h-full rounded-[14px] overflow-hidden">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white flex items-center justify-center text-indigo-600 font-bold">
                                                {session?.user?.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <form onSubmit={handlePost}>
                                        <textarea
                                            className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl p-4 text-gray-900 placeholder-gray-400 border border-transparent focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all outline-none"
                                            placeholder={`What's happening, ${session?.user?.name?.split(' ')[0]}?`}
                                            rows={2}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex gap-2">
                                                <button type="button" className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors">
                                                    <ImageIcon className="w-5 h-5" />
                                                </button>
                                                <button type="button" className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition-colors">
                                                    <SmilePlus className="w-5 h-5" />
                                                </button>
                                                <button type="button" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors">
                                                    <MapPin className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={visibility}
                                                    onChange={(e) => setVisibility(e.target.value as 'public' | 'batch')}
                                                    className="bg-gray-100 text-xs font-semibold text-gray-600 rounded-lg px-3 py-2 border-none focus:ring-0 cursor-pointer hover:bg-gray-200 transition-colors"
                                                >
                                                    <option value="public">Everyone</option>
                                                    <option value="batch">Batch Only</option>
                                                </select>
                                                <button
                                                    type="submit"
                                                    disabled={posting || !content.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none active:scale-95"
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Feed Stream */}
                        <div className="space-y-6">
                            {posts.length === 0 ? (
                                <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
                                    <p className="text-gray-500">Be the first to break the silence!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <article key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Link href={`/profile/${post.user.id}`} className="block flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 p-0.5 border border-white shadow-sm overflow-hidden hover:scale-105 transition-transform">
                                                        {post.user.profilePhoto ? (
                                                            <img src={post.user.profilePhoto} className="w-full h-full object-cover rounded-full" alt={post.user.name} />
                                                        ) : (
                                                            <div className="w-full h-full bg-white flex items-center justify-center text-xs font-bold text-gray-500">
                                                                {post.user.name?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                                <div>
                                                    <Link href={`/profile/${post.user.id}`} className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                                                        {post.user.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">Batch {post.user.passingYear}</span>
                                                        <span>•</span>
                                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                        {post.visibility === 'batch' && (
                                                            <span className="flex items-center gap-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                🔒 Batch
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="text-gray-800 mb-6 text-[15px] leading-relaxed whitespace-pre-wrap">
                                            {post.content}
                                        </div>

                                        <div className="flex items-center gap-1 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${post.likes.includes(session?.user?.id || '')
                                                    ? 'bg-pink-50 text-pink-600'
                                                    : 'hover:bg-gray-50 text-gray-500'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-full ${post.likes.includes(session?.user?.id || '') ? 'bg-pink-100' : 'group-hover:bg-white'}`}>
                                                    <Heart className={`w-4 h-4 ${post.likes.includes(session?.user?.id || '') ? 'fill-current' : ''}`} />
                                                </div>
                                                <span className="text-sm font-semibold">{post.likes.length > 0 ? post.likes.length : 'Like'}</span>
                                            </button>

                                            <button
                                                onClick={() => setCommenting(commenting === post.id ? null : post.id)}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all ml-2 ${commenting === post.id
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'hover:bg-gray-50 text-gray-500'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-full ${commenting === post.id ? 'bg-indigo-100' : 'group-hover:bg-white'}`}>
                                                    <MessageCircle className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-semibold">{post.comments?.length > 0 ? post.comments.length : 'Comment'}</span>
                                            </button>

                                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-500 transition-all ml-auto">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {commenting === post.id && (
                                            <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                                    {post.comments?.map((comment: any, idx: number) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                                                {comment.user?.name?.[0]}
                                                            </div>
                                                            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-bold text-xs text-gray-900">{comment.user?.name}</span>
                                                                    <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 leading-snug">{comment.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-3 items-center">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!commentText.trim()}
                                                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </article>
                                ))
                            )}
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
