import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import BatchGroup from '@/models/BatchGroup';
import Post from '@/models/Post';
import dbConnect from '@/lib/db';

const DEMO_PASSWORD = 'password123';

async function seed() {
    console.log('🌱 Starting seed...');
    await dbConnect();

    // Clear existing data
    await User.deleteMany({});
    await BatchGroup.deleteMany({});
    await Post.deleteMany({});
    console.log('🧹 Cleared database');

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // 1. Create Admin
    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@school.com',
        password: hashedPassword,
        passingYear: 2000,
        role: 'admin',
        status: 'approved',
        bio: 'System Administrator',
    });
    console.log('👤 Created Admin: admin@school.com');

    // 2. Create Batches
    const batch2015 = await BatchGroup.create({ year: 2015, members: [] });
    const batch2018 = await BatchGroup.create({ year: 2018, members: [] });

    // 3. Create Users
    const user1 = await User.create({
        name: 'Rahim Ahmed',
        email: 'rahim@test.com',
        password: hashedPassword,
        passingYear: 2015,
        role: 'user',
        status: 'approved',
        batchGroupId: batch2015._id,
        bio: 'Software Engineer at Google',
        occupation: 'Software Engineer',
    });
    batch2015.members.push(user1._id);

    const user2 = await User.create({
        name: 'Karim Uddin',
        email: 'karim@test.com',
        password: hashedPassword,
        passingYear: 2015,
        role: 'user',
        status: 'approved',
        batchGroupId: batch2015._id,
        bio: 'Business owner in Barishal',
    });
    batch2015.members.push(user2._id);
    await batch2015.save();

    const user3 = await User.create({
        name: 'Nusrat Jahan',
        email: 'child@test.com', // Intentional distinctive email
        password: hashedPassword,
        passingYear: 2018,
        role: 'user',
        status: 'approved',
        batchGroupId: batch2018._id,
        occupation: 'Doctor',
    });
    batch2018.members.push(user3._id);
    await batch2018.save();

    // Pending User
    await User.create({
        name: 'Pending Newb',
        email: 'new@test.com',
        password: hashedPassword,
        passingYear: 2020,
        status: 'pending',
    });

    console.log('👥 Created 3 Active Users, 1 Pending');

    // 4. Create Posts
    await Post.create({
        user: admin._id,
        content: 'Welcome to the official Barishal Zilla School Alumni platform! 🏫',
        visibility: 'public',
        likes: [user1._id, user2._id],
    });

    await Post.create({
        user: user1._id,
        content: 'Who else is from Batch 2015? Let\'s meet up this Eid! 🌙',
        visibility: 'batch',
        batchGroupId: batch2015._id,
        comments: [
            { user: user2._id, text: 'I am in! Let\'s go to Bibir Pukur.' }
        ]
    });

    await Post.create({
        user: user3._id,
        content: 'Looking for medical internship opportunities. Any alumni reference?',
        visibility: 'public',
        likes: [admin._id],
    });

    console.log('📝 Created sample posts');
    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
