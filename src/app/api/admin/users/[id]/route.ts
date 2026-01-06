import { NextResponse } from 'next/server';

export const runtime = 'edge';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to check admin role
async function isAdmin() {
    // @ts-ignore
    const session = await getServerSession(authOptions);
    // @ts-ignore
    return session?.user?.role === 'admin';
}

// DELETE User
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const userId = id;

        // Transaction to clean up user data
        await prisma.$transaction([
            prisma.like.deleteMany({ where: { userId } }),
            prisma.comment.deleteMany({ where: { userId } }),
            prisma.post.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } })
        ]);

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// UPDATE User Status/Role
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { status, role } = await req.json();
        const { id } = await params;
        const userId = id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const oldStatus = user.status;

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status, role }
        });

        // Logic: If transitioning TO approved, ensure batch assignment
        if (status === 'approved' && oldStatus !== 'approved' && updatedUser.passingYear) {
            const year = updatedUser.passingYear;

            // Find or create batch group
            // We use upsert logic or find-then-create
            let batch = await prisma.batchGroup.findUnique({
                where: { year }
            });

            if (!batch) {
                batch = await prisma.batchGroup.create({
                    data: { year }
                });
            }

            // Update user's batchGroupId if invalid
            if (updatedUser.batchGroupId !== batch.id) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { batchGroupId: batch.id }
                });
            }
        }

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
