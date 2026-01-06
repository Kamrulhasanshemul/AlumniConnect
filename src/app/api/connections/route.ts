import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// POST: Send Connection Request
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { addresseeId } = await req.json();

    if (!addresseeId || addresseeId === session.user.id) {
        return NextResponse.json({ message: 'Invalid User' }, { status: 400 });
    }

    try {
        // Check existing
        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { requesterId: session.user.id, addresseeId: addresseeId },
                    { requesterId: addresseeId, addresseeId: session.user.id }
                ]
            }
        });

        if (existing) return NextResponse.json({ message: 'Request already sent or connected' }, { status: 400 });

        const connection = await prisma.connection.create({
            data: {
                requesterId: session.user.id,
                addresseeId: addresseeId,
                status: 'PENDING'
            }
        });

        // Create Notification
        await prisma.notification.create({
            data: {
                type: 'CONNECTION_REQUEST',
                userId: addresseeId,
                actorId: session.user.id,
            }
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

// PUT: Accept Request
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { connectionId, action } = await req.json();

    try {
        const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
        if (!connection) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        if (connection.addresseeId !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        if (action === 'ACCEPT') {
            await prisma.connection.update({
                where: { id: connectionId },
                data: { status: 'ACCEPTED' }
            });

            await prisma.notification.create({
                data: {
                    type: 'CONNECTION_ACCEPTED',
                    userId: connection.requesterId,
                    actorId: session.user.id
                }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

// DELETE: Cancel/Reject
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Parse URL for ID
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

    try {
        await prisma.connection.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
