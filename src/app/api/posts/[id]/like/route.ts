import { NextResponse } from 'next/server';

// export const runtime = 'edge';

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // @ts-ignore
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const post = await prisma.post.findUnique({
            where: { id },
            include: { likes: true }
        });

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: id
                }
            }
        });

        let isLiked = false;

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            isLiked = false;
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    postId: id
                }
            });
            isLiked = true;
        }

        // Get updated count
        const updatedPost = await prisma.post.findUnique({
            where: { id },
            include: { likes: true }
        });

        return NextResponse.json({ likes: updatedPost?.likes.length || 0, isLiked });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
