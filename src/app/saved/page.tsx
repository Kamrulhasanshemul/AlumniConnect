'use client';

import PlaceholderPage from '@/components/PlaceholderPage';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
    return (
        <PlaceholderPage
            title="Saved Items"
            description="Access your bookmarked posts, events, and job listings here."
            icon={Bookmark}
        />
    );
}
