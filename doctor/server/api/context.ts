import { authOptions } from '@/server/auth';
import { getServerSession } from 'next-auth';
import { db } from '@/server/db';
import { razorpay } from '@/utils/razorpay';

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await getServerSession(authOptions);
    return {
        db,
        razorpay,
        session,
        ...opts,
    };
};