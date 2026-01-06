import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Fetch message history with a specific user
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { userId: otherUserId } = await params;

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: session.user.id }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark received messages as read
        await prisma.message.updateMany({
            where: { senderId: otherUserId, receiverId: session.user.id, read: false },
            data: { read: true }
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { userId: otherUserId } = await params;
    const body = await req.json();

    if (!body.content) return NextResponse.json({ message: 'Empty message' }, { status: 400 });

    try {
        const message = await prisma.message.create({
            data: {
                content: body.content,
                senderId: session.user.id,
                receiverId: otherUserId
            }
        });
        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
