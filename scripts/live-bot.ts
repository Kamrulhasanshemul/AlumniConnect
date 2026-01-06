import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/en_US';

const prisma = new PrismaClient();

// Configuration
const INTERVAL_MS = 60 * 1000; // 1 minute (adjustable) - user asked for "EVERY MINUTE"
const VARIANCE_MS = 30 * 1000; // +/- 30 seconds variance for natural feel

async function getRandomUser() {
    const count = await prisma.user.count();
    const skip = Math.floor(Math.random() * count);
    return await prisma.user.findFirst({ skip });
}

async function getRandomPost() {
    // Get a recent post to keep interactions fresh
    const posts = await prisma.post.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    });
    if (posts.length === 0) return null;
    return faker.helpers.arrayElement(posts);
}

async function createPost() {
    const user = await getRandomUser();
    if (!user) return;

    const content = faker.lorem.paragraph(1);
    const post = await prisma.post.create({
        data: {
            userId: user.id,
            content,
            visibility: Math.random() > 0.8 ? 'batch' : 'public',
            batchGroupId: Math.random() > 0.8 ? user.batchGroupId : null,
        }
    });
    console.log(`[BOT] 📝 ${user.name} posted: "${content.substring(0, 30)}..."`);
}

async function createComment() {
    const user = await getRandomUser();
    const post = await getRandomPost();
    if (!user || !post) return;

    const text = faker.helpers.arrayElement([
        "Interesting point!",
        "Totally agree.",
        "Thanks for sharing!",
        "When is the next meetup?",
        "Good luck with that!",
        "Wow!",
        faker.lorem.sentence()
    ]);

    const comment = await prisma.comment.create({
        data: {
            userId: user.id,
            postId: post.id,
            text
        }
    });
    console.log(`[BOT] 💬 ${user.name} commented on a post.`);

    // NOTIFICATION
    if (post.userId !== user.id) {
        await prisma.notification.create({
            data: {
                type: 'COMMENT',
                userId: post.userId,
                actorId: user.id,
                postId: post.id
            }
        });
    }
}

async function createLike() {
    const user = await getRandomUser();
    const post = await getRandomPost();
    if (!user || !post) return;

    try {
        await prisma.like.create({
            data: {
                userId: user.id,
                postId: post.id
            }
        });
        console.log(`[BOT] ❤️ ${user.name} liked a post.`);

        // NOTIFICATION
        if (post.userId !== user.id) {
            await prisma.notification.create({
                data: {
                    type: 'LIKE',
                    userId: post.userId,
                    actorId: user.id,
                    postId: post.id
                }
            });
        }
    } catch (e) {
        // Ignore duplicate likes
    }
}

async function loop() {
    try {
        const action = Math.random();

        if (action < 0.35) {
            await createPost();
        } else if (action < 0.70) {
            await createComment();
        } else {
            await createLike();
        }

    } catch (error) {
        console.error('[BOT ERROR]', error);
    } finally {
        // Schedule next action
        const nextDelay = INTERVAL_MS + (Math.random() * VARIANCE_MS - (VARIANCE_MS / 2));
        console.log(`[BOT] Sleeping for ${Math.round(nextDelay / 1000)}s...`);
        setTimeout(loop, nextDelay);
    }
}

console.log('🤖 Live Activity Bot Started! Press Ctrl+C to stop.');
loop();
