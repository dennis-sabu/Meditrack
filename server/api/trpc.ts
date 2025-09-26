/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { authOptions } from '@/server/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { db } from '@/server/db';
import { getTrpcError } from '../db/utils';
import { eq } from 'drizzle-orm';
import { masterAdmin } from '../db/schema';
import { userRouters } from '../routes/userRoute';
import { createTRPCContext } from './context';
import { isAdminEmail } from '@/lib/validator';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */


/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw getTrpcError('NOT_LOGGED_IN');
    }
    if (isAdminEmail(ctx.session.user.email)) {
        const userData = await ctx.db.query.masterAdmin.findFirst({
            where: (users) => eq(users.id, ctx.session!.user.id),
        })
        if (!userData) {
            console.log("ADMIN NOT FOUND");
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin Not found" });
        }
        return next({
            ctx: {
                session: { ...ctx.session, user: ctx.session.user },
                user: {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.name,
                    lastName: '',
                    emailVerified: true,
                    username: userData.name,
                    phone: '',
                    image: '',
                    loginType: "Credentials",
                    loginToken: '',
                    role: userData.roles,
                    emailVerificationToken: '',
                    password: userData.password,
                },
                role: userData.roles,
            },
        });
    }
    const userData = await ctx.db.query.user.findFirst({
        where: (users) => eq(users.id, ctx.session!.user.id),
        columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
            password: true,
            image: true,
            emailVerificationToken: true,
            emailVerified: true,
            role: true,
            loginType: true,
            loginToken: true,
        },
    });
    if (!userData) {
        console.log("USER NOT FOUND");
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
    }
    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user },
            user: userData,
            role: userData.role,
        },
    });
});

export const isMasterAdmin = protectedProcedure.use(async ({ ctx, next }) => {
    const admin = await ctx.db.query.masterAdmin.findFirst({
        where: eq(masterAdmin.id, ctx.session.user.id),
    });
    if (!admin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access Denied" });
    }
    return next();
});


export const roleMiddleware = (allowedRoles: string[]) => protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }
    if (!allowedRoles.includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
    }
    return next();
});



/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
*
* These are the pieces you use to build your tRPC API. You should import these a lot in the
* "/server/api/routers" directory.
*/
// export const createCallerFactory = t.createCallerFactory(appRouter);
/**
 * This is how you create new routers and sub-routers in your tRPC API.
*
* @see https://trpc.io/docs/router
*/


