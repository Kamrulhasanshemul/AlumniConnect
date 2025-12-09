import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BatchGroup from '@/models/BatchGroup';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;
        const { status } = await req.json();

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const oldStatus = user.status;
        user.status = status;
        await user.save();

        // Logic: If transitioning TO approved
        if (status === 'approved' && oldStatus !== 'approved') {
            const year = user.passingYear;

            // Find or create batch group
            let batch = await BatchGroup.findOne({ year });
            if (!batch) {
                batch = await BatchGroup.create({ year, members: [] });
            }

            // Add user to batch if not already there
            if (!batch.members.includes(user._id)) {
                batch.members.push(user._id);
                await batch.save();
            }

            // Update user with batch ID
            user.batchGroupId = batch._id;
            await user.save();
        }

        // Logic: If transitioning FROM approved (e.g. suspending user), remove from batch?
        // For MVP, keeping it simple (add-only mostly). 

        return NextResponse.json({ message: `User ${status}`, user });
    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
