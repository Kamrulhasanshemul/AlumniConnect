import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Fetch list of conversations (users messaged with)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Determine unique users interacted with
        const sent = await prisma.message.findMany({
            where: { senderId: session.user.id },
            distinct: ['receiverId'],
            select: { receiverId: true }
        });

        const received = await prisma.message.findMany({
            where: { receiverId: session.user.id },
            distinct: ['senderId'],
            select: { senderId: true }
        });

        // Combine IDs
        const userIds = Array.from(new Set([
            ...sent.map(m => m.receiverId),
            ...received.map(m => m.senderId)
        ]));

        // Fetch user details
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, profilePhoto: true, passingYear: true }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
