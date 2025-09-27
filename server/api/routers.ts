import { createTRPCRouter } from './trpc';
import { authRouter } from '../routes/authRoute';
import { user } from '../db/schema';
import { userRouter } from '../routes/userRoute';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
