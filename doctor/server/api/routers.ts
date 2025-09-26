import { createTRPCRouter } from './trpc';
import { authRouter } from '../routes/authRoute';
import { adminRouter } from '../routes/adminRoute';
import { hospitalRouter } from '../routes/hospitalRoute';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    admin: adminRouter,
    hospital: hospitalRouter,
});

export type AppRouter = typeof appRouter;
