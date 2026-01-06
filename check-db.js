const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load .env manually since we're running with plain node
try {
    const envPath = path.resolve(__dirname, '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} catch (e) {
    console.warn('Could not load .env file:', e.message);
}

const prisma = new PrismaClient()

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@school.com' },
        })
        console.log(user ? 'Found admin user' : 'No admin user found')
    } catch (e) {
        console.error('Error connecting to database:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
