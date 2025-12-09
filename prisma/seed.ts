import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'password123';

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.batchGroup.deleteMany({});

    console.log('🧹 Cleared database');

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // 1. Create Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@school.com',
            password: hashedPassword,
            passingYear: 2000,
            role: 'admin',
            status: 'approved',
            bio: 'System Administrator',
        },
    });
    console.log('👤 Created Admin: admin@school.com');

    // 2. Create Batches
    const batch2015 = await prisma.batchGroup.create({ data: { year: 2015 } });
    const batch2018 = await prisma.batchGroup.create({ data: { year: 2018 } });

    // 3. Create Users
    const user1 = await prisma.user.create({
        data: {
            name: 'Rahim Ahmed',
            email: 'rahim@test.com',
            password: hashedPassword,
            passingYear: 2015,
            role: 'user',
            status: 'approved',
            batchGroupId: batch2015.id,
            bio: 'Software Engineer at Google',
            occupation: 'Software Engineer',
        }
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Karim Uddin',
            email: 'karim@test.com',
            password: hashedPassword,
            passingYear: 2015,
            role: 'user',
            status: 'approved',
            batchGroupId: batch2015.id,
            bio: 'Business owner in Barishal',
        }
    });

    const user3 = await prisma.user.create({
        data: {
            name: 'Nusrat Jahan',
            email: 'child@test.com',
            password: hashedPassword,
            passingYear: 2018,
            role: 'user',
            status: 'approved',
            batchGroupId: batch2018.id,
            occupation: 'Doctor',
        }
    });

    // Pending User
    await prisma.user.create({
        data: {
            name: 'Pending Newb',
            email: 'new@test.com',
            password: hashedPassword,
            passingYear: 2020,
            status: 'pending',
        }
    });

    console.log('👥 Created 3 Active Users, 1 Pending');

    // 4. Create Posts
    await prisma.post.create({
        data: {
            userId: admin.id,
            content: 'Welcome to the official Barishal Zilla School Alumni platform! 🏫',
            visibility: 'public',
            likes: {
                create: [
                    { userId: user1.id },
                    { userId: user2.id }
                ]
            }
        }
    });

    await prisma.post.create({
        data: {
            userId: user1.id,
            content: 'Who else is from Batch 2015? Let\'s meet up this Eid! 🌙',
            visibility: 'batch',
            batchGroupId: batch2015.id,
            comments: {
                create: [
                    { userId: user2.id, text: 'I am in! Let\'s go to Bibir Pukur.' }
                ]
            }
        }
    });

    await prisma.post.create({
        data: {
            userId: user3.id,
            content: 'Looking for medical internship opportunities. Any alumni reference?',
            visibility: 'public',
            likes: {
                create: [
                    { userId: admin.id }
                ]
            }
        }
    });

    console.log('📝 Created sample posts');
    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
