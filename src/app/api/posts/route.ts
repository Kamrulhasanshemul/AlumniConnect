import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        // @ts-ignore
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        const batchGroupId = currentUser?.batchGroupId;
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter'); // 'public', 'batch', or 'all' (default)

        let where: any = {};

        if (filter === 'public') {
            where.visibility = 'public';
        } else if (filter === 'batch') {
            if (!batchGroupId) {
                return NextResponse.json([]);
            }
            where = { visibility: 'batch', batchGroupId };
        } else {
            // All allowed posts: Public OR (Batch users batch)
            where = {
                OR: [
                    { visibility: 'public' },
                    { visibility: 'batch', batchGroupId: batchGroupId }
                ]
            };
        }

        const posts = await prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, profilePhoto: true, passingYear: true }
                },
                comments: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                likes: {
                    select: { userId: true } // Return userIds of likes to map on frontend
                }
            }
        });

        // Transform posts to match expected frontend structure (likes: string[])
        const formattedPosts = posts.map((post: any) => ({
            ...post,
            likes: post.likes.map((like: any) => like.userId),
        }));

        return NextResponse.json(formattedPosts);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // @ts-ignore
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { content, visibility } = await req.json();

        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        let postData: any = {
            userId: session.user.id,
            content,
            visibility: visibility || 'public',
        };

        if (postData.visibility === 'batch') {
            if (!currentUser.batchGroupId) {
                return NextResponse.json({ message: 'You are not assigned to a batch yet.' }, { status: 400 });
            }
            postData.batchGroupId = currentUser.batchGroupId;
        }

        const post = await prisma.post.create({
            data: postData,
            include: {
                user: { select: { name: true, profilePhoto: true, passingYear: true } },
                likes: true,
                comments: true
            }
        });

        // Format for frontend
        const formattedPost = {
            ...post,
            likes: post.likes.map((l: any) => l.userId)
        };

        return NextResponse.json(formattedPost, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
