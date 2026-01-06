'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Search, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations list
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await fetch('/api/messages');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // Fetch messages for active user
    useEffect(() => {
        if (!activeUserId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages/${activeUserId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                    scrollToBottom();
                }
            } catch (error) { console.error(error); }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll chat every 3s
        return () => clearInterval(interval);
    }, [activeUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeUserId) return;

        const tempId = Date.now().toString();
        const newMessage = {
            id: tempId,
            content: inputText,
            senderId: session?.user?.id,
            createdAt: new Date().toISOString()
        };

        // Optimistic UI update
        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        scrollToBottom();

        try {
            await fetch(`/api/messages/${activeUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage.content }),
            });
        } catch (error) {
            console.error('Failed to send');
        }
    };

    const activeUser = conversations.find(u => u.id === activeUserId);

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-16 bg-gray-50 h-screen flex flex-col">
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-6rem)] flex overflow-hidden">

                    {/* Left Sidebar: Conversations */}
                    <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-lg text-gray-800 mb-4">Messages</h2>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search people..."
                                    className="w-full bg-white pl-9 pr-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-100 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <p>No conversations yet.</p>
                                    <p className="text-sm mt-2">Visit someone's profile to start chatting.</p>
                                </div>
                            ) : (
                                conversations.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setActiveUserId(user.id)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-50/50 text-left ${activeUserId === user.id ? 'bg-white shadow-sm border-l-4 border-l-indigo-500' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {user.profilePhoto ? (
                                                <img src={user.profilePhoto} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-indigo-700">{user.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-sm truncate ${activeUserId === user.id ? 'text-indigo-900' : 'text-gray-900'}`}>{user.name}</h3>
                                            <p className="text-xs text-gray-400 truncate">Click to view messages</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Chat Window */}
                    <div className={`flex-1 flex flex-col bg-white ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
                        {!activeUserId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-medium">Select a conversation to start messaging</p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm bg-white/80 backdrop-blur-md z-10">
                                    <button onClick={() => setActiveUserId(null)} className="md:hidden text-gray-500 mr-2">
                                        Scan...
                                        Back
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                        {activeUser?.profilePhoto ? (
                                            <img src={activeUser.profilePhoto} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-indigo-700">{activeUser?.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{activeUser?.name}</h3>
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Online
                                        </p>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === session?.user?.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSend} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 rounded-xl px-4 py-3 text-sm transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!inputText.trim()}
                                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
