const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const likeCount = await prisma.like.count();

    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Comments: ${commentCount}`);
    console.log(`Likes: ${likeCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
