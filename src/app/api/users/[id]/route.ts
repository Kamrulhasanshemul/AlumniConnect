import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch public user details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = await params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                coverPhoto: true,
                bio: true,
                occupation: true,
                location: true,
                passingYear: true,
                // Don't expose password, role, status etc publicly unless needed
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
