import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@school.com';
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!admin) {
        console.error('Admin not found');
        return;
    }

    console.log(`Checking requests sent by ${admin.name} (${admin.id})...`);

    const pendingRequest = await prisma.connection.findFirst({
        where: {
            requesterId: admin.id,
            status: 'PENDING'
        },
        include: { addressee: true }
    });

    if (!pendingRequest) {
        console.log('No pending requests found from admin. Go to the UI and send a request to someone!');
        return;
    }

    console.log(`Found pending request to: ${pendingRequest.addressee.name}`);
    console.log('Simulating acceptance...');

    await prisma.connection.update({
        where: { id: pendingRequest.id },
        data: { status: 'ACCEPTED' }
    });

    await prisma.notification.create({
        data: {
            type: 'CONNECTION_ACCEPTED',
            userId: admin.id,
            actorId: pendingRequest.addressee.id
        }
    });

    console.log('✅ Request accepted and notification sent! Check your dashboard.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
