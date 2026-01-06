import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/en_US'; // Using US locale for international feel, or we could use mixed
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration
const NUM_USERS = 50;
const POSTS_PER_USER_MIN = 1;
const POSTS_PER_USER_MAX = 5;
const INTERACTION_RATE = 0.7; // 70% chance a user interacts with a post

// Real-ish data subsets for specific context
const BANGLADESHI_NAMES = [
    "Rahim", "Karim", "Nusrat", "Fatima", "Ayesha", "Mohammed", "Abdullah", "Tanvir",
    "Sadia", "Farhana", "Jannat", "Rafiq", "Hassan", "Kamrul", "Shemul", "Zarif"
];

const OCCUPATIONS = [
    "Software Engineer", "Data Scientist", "Doctor", "Civil Engineer", "Banker",
    "University Professor", "Business Owner", "Graphic Designer", "Architect", "Lawyer",
    "Government Officer", "Student", "Researcher", "Entrepreneur"
];

const LOCATIONS = [
    "Dhaka, Bangladesh", "Chittagong, Bangladesh", "Barishal, Bangladesh", "Sylhet, Bangladesh",
    "New York, USA", "London, UK", "Toronto, Canada", "Sydney, Australia", "Berlin, Germany",
    "Singapore", "Dubai, UAE"
];

async function main() {
    console.log('🌱 Starting realistic seed...');

    // 1. Ensure Batch Groups exist (2000 - 2025)
    console.log('Creating batches...');
    const batches = [];
    for (let year = 2000; year <= 2025; year++) {
        const batch = await prisma.batchGroup.upsert({
            where: { year },
            update: {},
            create: { year },
        });
        batches.push(batch);
    }

    // 2. Create Users
    console.log(`Creating ${NUM_USERS} users...`);
    const password = await bcrypt.hash('password123', 10);
    const users = [];

    for (let i = 0; i < NUM_USERS; i++) {
        const isLocalName = Math.random() > 0.3; // 70% chance of distinct local name
        const firstName = isLocalName
            ? faker.helpers.arrayElement(BANGLADESHI_NAMES)
            : faker.person.firstName();

        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;

        // Create meaningful bio
        const occupation = faker.helpers.arrayElement(OCCUPATIONS);
        const company = faker.company.name();
        const bio = `${occupation} at ${company}. ${faker.person.bio()}`;
        const location = faker.helpers.arrayElement(LOCATIONS);
        const passingYear = faker.helpers.rangeToNumber({ min: 2000, max: 2025 });

        // Find matching batch
        const batch = batches.find(b => b.year === passingYear);

        // Profile photo: use UI Avatars or faker image if available, but UI Avatars is reliable for initials/colors
        // or use a placeholder service that gives faces
        const gender = Math.random() > 0.5 ? 'men' : 'women';
        const profilePhoto = `https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 90)}.jpg`;

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
                    password,
                    role: 'user',
                    status: 'approved',
                    passingYear,
                    batchGroupId: batch?.id,
                    bio,
                    occupation,
                    location,
                    profilePhoto,
                    socialLinks: {
                        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
                        twitter: `https://twitter.com/${firstName.toLowerCase()}`
                    }
                }
            });
            users.push(user);
        } catch (e) {
            console.log(`Skipped duplicate or error for ${name}`);
        }
    }

    // 3. Create Posts
    console.log('Creating posts...');
    const allPosts = [];

    for (const user of users) {
        const numPosts = faker.helpers.rangeToNumber({ min: POSTS_PER_USER_MIN, max: POSTS_PER_USER_MAX });

        for (let j = 0; j < numPosts; j++) {
            const isBatchOnly = Math.random() > 0.8; // 20% batch only

            let content = "";
            const type = Math.random();
            if (type < 0.3) {
                content = `Just finished a great project at ${user.occupation?.split(' ')[2] || 'work'}! 🚀 #career #milestone`;
            } else if (type < 0.5) {
                content = `Does anyone from Batch ${user.passingYear} remember our final day? Missing those simpler times. 🏫`;
            } else if (type < 0.7) {
                content = `Looking for recommendations for a good vacation spot near ${user.location}. Any suggestions? ✈️`;
            } else {
                content = faker.lorem.paragraph();
            }

            const post = await prisma.post.create({
                data: {
                    userId: user.id,
                    content,
                    visibility: isBatchOnly ? 'batch' : 'public',
                    batchGroupId: isBatchOnly ? user.batchGroupId : null,
                    createdAt: faker.date.recent({ days: 30 }), // Posts from last 30 days
                }
            });
            allPosts.push(post);
        }
    }

    // 4. Create Interactions (Likes & Comments)
    console.log('Generating buzz (likes & comments)...');

    for (const post of allPosts) {
        // Random likes
        const numLikes = faker.helpers.rangeToNumber({ min: 0, max: 15 });
        const likers = faker.helpers.arrayElements(users, numLikes);

        for (const liker of likers) {
            try {
                await prisma.like.create({
                    data: {
                        userId: liker.id,
                        postId: post.id
                    }
                });
            } catch (e) { } // Ignore duplicate likes
        }

        // Random comments
        if (Math.random() > 0.5) {
            const numComments = faker.helpers.rangeToNumber({ min: 1, max: 5 });
            const commenters = faker.helpers.arrayElements(users, numComments);

            for (const commenter of commenters) {
                await prisma.comment.create({
                    data: {
                        userId: commenter.id,
                        postId: post.id,
                        text: faker.helpers.arrayElement([
                            "Great update!",
                            "Congratulations! 🎉",
                            "Miss you guys!",
                            "Let's catch up soon.",
                            "Wow, that's amazing.",
                            "Agreed 100%.",
                            "Best of luck!",
                            faker.lorem.sentence()
                        ]),
                        createdAt: faker.date.recent({ days: 5 })
                    }
                });
            }
        }
    }

    console.log('✅ Mock data generation complete!');
    console.log(`Generated: ${users.length} users, ${allPosts.length} posts.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
