import { NextResponse } from 'next/server';
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

        const { text } = await req.json();

        if (!text || !text.trim()) {
            return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Create comment
        await prisma.comment.create({
            data: {
                text,
                userId: session.user.id,
                postId: id
            }
        });

        // Return the full updated post
        const updatedPost = await prisma.post.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, profilePhoto: true, passingYear: true } },
                comments: {
                    include: {
                        user: { select: { name: true, profilePhoto: true } }
                    }
                },
                likes: { select: { userId: true } }
            }
        });

        if (!updatedPost) throw new Error('Failed to fetch updated post');

        // Format
        const formattedPost = {
            ...updatedPost,
            likes: updatedPost.likes.map(l => l.userId)
        };

        return NextResponse.json(formattedPost);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
