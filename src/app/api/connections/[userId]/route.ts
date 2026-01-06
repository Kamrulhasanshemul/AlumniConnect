import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Check connection status with user
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { userId: targetUserId } = await params;

    try {
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { requesterId: session.user.id, addresseeId: targetUserId },
                    { requesterId: targetUserId, addresseeId: session.user.id }
                ]
            }
        });

        return NextResponse.json(connection || null);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
