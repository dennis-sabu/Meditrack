import { authOptions } from '@/server/auth';
import { getServerSession } from 'next-auth';
import { db } from '@/server/db';

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await getServerSession(authOptions);
    return {
        db,
        session,
        ...opts,
    };
};