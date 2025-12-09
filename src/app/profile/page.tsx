'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import {
    MapPin,
    Briefcase,
    Calendar,
    Mail,
    Phone,
    Edit3,
    Camera,
    Grid,
    Users,
    Heart
} from 'lucide-react';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [formData, setFormData] = useState({
        bio: '',
        occupation: '',
        location: '',
        phone: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            setProfile(data);
            setFormData({
                bio: data.bio || '',
                occupation: data.occupation || '',
                location: data.location || '',
                phone: data.phone || '',
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Failed to update');
            const updated = await res.json();
            setProfile(updated);
            setIsEditing(false);
        } catch (error) {
            alert('Error updating profile');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <Sidebar />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6 pb-20">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Cover Photo - Gradient fallback */}
                            <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                                <button className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-all">
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-6 pb-6 relative">
                                <div className="flex justify-between items-end -mt-16 mb-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                                            <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 text-4xl">
                                                {profile.profilePhoto ? (
                                                    <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>👤</span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition-colors border-2 border-white">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mb-2">
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-left mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {profile.name}
                                        <div className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                            Batch {profile.passingYear}
                                        </div>
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1 max-w-lg">
                                        {profile.bio || 'Add a bio to let people know more about you.'}
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
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{profile.email}</span>
                                        </div>
                                        {profile.phone && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex border-t border-gray-100 pt-1">
                                    {['Posts', 'About', 'Photos', 'Friends'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab.toLowerCase())}
                                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        {isEditing && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile Details
                                </h3>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                            rows={3}
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                value={formData.occupation}
                                                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Content Tabs (Placeholder content for now) */}
                        {activeTab === 'posts' && (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                                <Grid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No posts yet.</p>
                            </div>
                        )}
                        {activeTab === 'friends' && (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Connections list coming soon.</p>
                            </div>
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
