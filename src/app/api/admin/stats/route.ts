import { NextResponse } from 'next/server';

// export const runtime = 'edge';

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        // Fetch counts
        const totalUsers = await prisma.user.count({ where: { role: 'user' } });
        const pendingUsers = await prisma.user.count({ where: { status: 'pending' } });
        const totalPosts = await prisma.post.count();

        return NextResponse.json({
            users: totalUsers,
            pending: pendingUsers,
            posts: totalPosts,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
