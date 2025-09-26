import { createTRPCRouter } from './trpc';
import { userRouters } from '../routes/userRoute';
import { authRouter } from '../routes/authRoute';
import { adminRouter } from '../routes/adminRoute';
import { paymentRouter } from '../routes/paymentRoute';
import { appSettingsRouter } from '../routes/appSettingsRouter';
import { hospitalRouter } from '../routes/hospitalRoute';
import { doctorRouter } from '../routes/doctorRoute';

export const appRouter = createTRPCRouter({
    userRouter: userRouters,
    auth: authRouter,
    admin: adminRouter,
    hospital: hospitalRouter,
    doctor: doctorRouter,
    payment: paymentRouter,
    settings: appSettingsRouter,
});

export type AppRouter = typeof appRouter;
