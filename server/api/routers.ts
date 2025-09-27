import { createTRPCRouter } from './trpc';
import { authRouter } from '../routes/authRoute';
import { hospitalRouter } from '../routes/hospitalRoute';
import { doctorRouter } from '../routes/doctorRoute';
import { user } from '../db/schema';
import { userRouter } from '../routes/userRoute';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    hospital: hospitalRouter,
    doctor: doctorRouter,
    user: userRouter,
});

export type AppRouter = typeof appRouter;
