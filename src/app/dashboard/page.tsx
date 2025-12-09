'use client';

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
    Send
} from 'lucide-react';

interface Post {
    _id: string;
    user: {
        _id: string;
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

            await fetchPosts(); // Refresh feed
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
                if (p._id === postId) {
                    const userId = session?.user?.id || '';
                    const newLikes = data.isLiked
                        ? [...p.likes, userId]
                        : p.likes.filter(id => id !== userId);
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const userId = session?.user?.id || '';
                    const newLikes = data.isLiked
                        ? [...p.likes, userId]
                        : p.likes.filter(id => id !== userId);
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
            fetchPosts(); // Background sync
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

            setPosts(posts.map(p => p._id === postId ? updatedPost : p));
            setCommentText('');
            // Keep comment section open
            fetchPosts(); // Background sync
        } catch (error) {
            console.error(error);
            alert('Failed to add comment');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 3-Column Layout */}
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <Sidebar />
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6 pb-20">
                        {/* Post Creation Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                                    {session?.user?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1">
                                    <form onSubmit={handlePost}>
                                        <textarea
                                            className="w-full bg-gray-50 rounded-xl p-3 text-gray-900 placeholder-gray-500 border-none focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                                            placeholder={`What's on your mind, ${session?.user?.name?.split(' ')[0]}?`}
                                            rows={2}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center mt-3 px-1">
                                            <div className="flex space-x-4 text-gray-400">
                                                <button type="button" className="hover:text-indigo-600 transition-colors flex items-center space-x-1">
                                                    <ImageIcon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">Photo</span>
                                                </button>
                                                <button type="button" className="hover:text-indigo-600 transition-colors flex items-center space-x-1">
                                                    <Smile className="w-5 h-5" />
                                                    <span className="text-xs font-medium">Activity</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <select
                                                    value={visibility}
                                                    onChange={(e) => setVisibility(e.target.value as 'public' | 'batch')}
                                                    className="bg-gray-50 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-300"
                                                >
                                                    <option value="public">Public</option>
                                                    <option value="batch">Batch Only</option>
                                                </select>
                                                <button
                                                    type="submit"
                                                    disabled={posting || !content.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        {posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-medium">No posts yet</p>
                                <p className="text-sm text-gray-400">Be the first to share an update!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <article key={post._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border border-indigo-100">
                                                {post.user.profilePhoto ? (
                                                    <img src={post.user.profilePhoto} className="w-full h-full object-cover" alt={post.user.name} />
                                                ) : (
                                                    <span className="text-lg font-bold text-indigo-600">{post.user.name?.[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{post.user.name}</h3>
                                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                                    <span>Batch {post.user.passingYear}</span>
                                                    <span>•</span>
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    {post.visibility === 'batch' && (
                                                        <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-100">
                                                            Batch Only
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="text-gray-800 mb-4 whitespace-pre-wrap text-[15px] leading-relaxed">
                                        {post.content}
                                    </div>

                                    <div className="flex items-center border-t border-gray-50 pt-3 mt-2">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center space-x-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 ${post.likes.includes(session?.user?.id || '')
                                                ? 'text-pink-600'
                                                : 'text-gray-500 hover:text-pink-500'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${post.likes.includes(session?.user?.id || '') ? 'fill-current' : ''}`} />
                                            <span>{post.likes.length > 0 && post.likes.length}</span>
                                        </button>

                                        <button
                                            onClick={() => setCommenting(commenting === post._id ? null : post._id)}
                                            className={`flex items-center space-x-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ml-2 ${commenting === post._id ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span>{post.comments?.length > 0 && post.comments.length}</span>
                                        </button>

                                        <button className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors ml-auto">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    {commenting === post._id && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
                                            <form onSubmit={(e) => handleComment(e, post._id)} className="flex items-start space-x-3 mb-4">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                                                    {session?.user?.name?.[0]}
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 pr-10"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!commentText.trim()}
                                                        className="absolute right-2 top-1.5 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </form>

                                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                                                {post.comments?.map((comment: any, idx: number) => (
                                                    <div key={idx} className="flex space-x-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                                                            {comment.user?.name?.[0] || '?'}
                                                        </div>
                                                        <div className="bg-gray-50 rounded-2xl px-4 py-2 flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-semibold text-xs text-gray-900">{comment.user?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </article>
                            ))
                        )}
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
