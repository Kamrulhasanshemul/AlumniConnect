import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'user' | 'admin';
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        role: 'user' | 'admin';
        status?: 'pending' | 'approved' | 'rejected';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: 'user' | 'admin';
        id: string;
    }
}
