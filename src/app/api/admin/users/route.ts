import { NextResponse } from 'next/server';

// export const runtime = 'edge';

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Helper to check admin role
async function isAdmin() {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    // @ts-ignore
    return session?.user?.role === 'admin';
}

export async function GET(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Parse query params
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status) where.status = status;

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                passingYear: true,
                createdAt: true,
                batchGroupId: true,
            }
        });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
