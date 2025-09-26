
import { z } from "zod";
import { createTRPCRouter, isMasterAdmin, protectedProcedure, publicProcedure } from "../api/trpc";
import { appVersions, diocesesTable, parishTable, user } from "../db/schema";
import { userZod } from "@/lib/validator";
import { ROLES } from "@/logic";
import bcrypt from 'bcrypt';
import { and, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { maskEmail, triedAsync } from "@/lib/utils";
import { ALL_DIOCESE, ALL_PARISH } from "@/utils";
const versionInput = z.object({
    title: z.string().max(255),
    version: z.string().max(200),
    isMandatory: z.boolean().optional(),
    description: z.string().optional(),
});

const updateVersionInput = versionInput.extend({
    id: z.number(),
});
export const userRouters = createTRPCRouter({
    onboard: protectedProcedure.input(
        z.object({
            name: z.string().optional(),
        })
    ).query(async ({ ctx, input }) => {
        const open = await ctx.db.select().from(user).where(eq(user.id, ctx.session?.user.id ?? ''));
        if (open.length == 0) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User Not Found" });
        }
        if (open[0]?.onboardOpen == false) {
            const data = await ctx.db.update(user).set({
                onboardOpen: true
            }).where(eq(user.id, ctx.session?.user.id ?? ''));
            return {
                alreadyOpen: false
            }
        }
        return {
            alreadyOpen: true
        }
    }),
    signin: publicProcedure.input(z.object({
        phone: z.number(),
        cc: z.string(),
    })).mutation(async ({ ctx, input }) => {
        // await ctx.db.insert(diocesesTable).values(
        //     ALL_DIOCESE.map(d => ({
        //         id: parseInt(d.id),
        //         order_id: parseInt(d.id), // assuming order_id == id
        //         name: d.text.trim(),
        //     }))
        // ).onConflictDoNothing(); // avoids duplicate key issues

        // // Step 2: Insert Parishes
        // await ctx.db.insert(parishTable).values(
        //     ALL_PARISH.map(p => ({
        //         id: parseInt(p.id),
        //         diocese_id: parseInt(p.diocese_id),
        //         name: p.text.replace(/\?/g, "'").trim(), // handle ? and trim whitespace
        //     }))
        // ).onConflictDoNothing();
        const cc = input.cc.includes("+") ? input.cc.replaceAll('+', '') : input.cc
        const users = await ctx.db.query.user.findFirst({
            where: (user) => and(eq(user.phone, `${input.phone}`), eq(user.user_cc, parseInt(cc))),
        })


        if (!users) {
            throw new TRPCError({ message: "USER NOT FOUND", code: "NOT_FOUND" });
        }
        const u = await ctx.db.update(user).set({
            loginToken: sql`gen_random_uuid()`
        }).where(and(eq(user.phone, `${input.phone}`), eq(user.user_cc, parseInt(cc)))).returning()

        return {
            message: "User Found",
            loginToken: u[0]?.loginToken,
            name: `${users.firstName} ${u[0]?.familyName ?? ''}`,
            email: maskEmail(users.email),
            redirect: null
        }
    }),
    getUser: protectedProcedure.input(z.void()).query(async ({ ctx, input }) => {
        const users = await ctx.db.query.user.findFirst({
            where: (user) => eq(user.id, ctx.user.id),
        })
        if (!users) {
            throw new TRPCError({ message: "USER NOT FOUND", code: "NOT_FOUND" });
        }
        return users;
    }),
    getDioceses: publicProcedure.input(z.void()).query(async ({ ctx, input }) => {
        const dioceses = await ctx.db.query.diocesesTable.findMany({
            with: {
                parishes: true
            }
        })
        return {
            data: dioceses
        };
    }),
    updateUser: protectedProcedure.input(z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        familyName: z.string().min(1, 'Family name is required'),
        bio: z.string().optional(),
        dateOfBirth: z.string().min(1, 'Date of Birth is required'),
        country: z.string().min(1, 'Country is required'),
        state: z.string().min(3, 'State is required'),
        parishId: z.number().min(1, 'Parish is required'),
        address: z.string().min(5, "Address is required"),   // ➡️ Added Address to Zod Schema
    })).mutation(async ({ ctx, input }) => {
        const u = await triedAsync(ctx.db.query.user.findFirst({
            where: (user) => eq(user.id, ctx.session?.user?.id ?? '')
        }))
        if (!u.isSuccess) return
        const res = await ctx.db.update(user).set({
            firstName: input.firstName,
            lastName: input.lastName,
            familyName: input.familyName,
            bio: input.bio ?? null,
            dateOfBirth: input.dateOfBirth,
            country: input.country,
            state: input.state,
            parishId: input.parishId,
            address: input.address,
        }).where(eq(user.id, u.data?.id ?? '')).returning();
        if (res) {
            return res[0]
        }
    }),
    fetchVersion: publicProcedure.input(z.void()).query(async ({ ctx, input }) => {
        const version = await ctx.db.query.appVersions.findFirst({
            orderBy: (appVersions, { desc }) => desc(appVersions.id),
        });
        if (!version) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
        }
        return {
            version: version,
        };
    }),
    // export const appVersions = pgTable("app_version", {
    //     id: serial("id").primaryKey(),
    //     title: varchar("title", { length: 255 }).notNull(),
    //     version: varchar("value", { length: 200 }).notNull(),
    //     isMandatory: boolean().default(false).notNull(),
    //     description: text("description"),
    //     updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // });
    fetchAllVersion: publicProcedure.input(z.void()).query(async ({ ctx, input }) => {
        const versions = await ctx.db.query.appVersions.findMany({
            orderBy: (appVersions, { desc }) => desc(appVersions.id),
        });

        return versions
    }),
    insertVersion: isMasterAdmin
        .input(versionInput)
        .mutation(async ({ ctx, input }) => {
            const newVersion = await ctx.db.insert(appVersions).values({
                title: input.title,
                version: input.version,
                isMandatory: input.isMandatory ?? false,
                description: input.description ?? "",
            }).returning();

            return newVersion[0];
        }),
    updateVersion: isMasterAdmin
        .input(updateVersionInput)
        .mutation(async ({ ctx, input }) => {
            const updated = await ctx.db.update(appVersions)
                .set({
                    title: input.title,
                    version: input.version,
                    isMandatory: input.isMandatory ?? false,
                    description: input.description ?? "",
                    updatedAt: new Date(),
                })
                .where(eq(appVersions.id, input.id))
                .returning();

            if (!updated[0]) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
            }

            return updated[0];
        }),
    deleteVersion: isMasterAdmin
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const deleted = await ctx.db.delete(appVersions)
                .where(eq(appVersions.id, input.id))
                .returning();

            if (!deleted[0]) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
            }

            return { success: true };
        }),
    // register: publicProcedure.input(
    //     z.object({
    //         email: z.string().email(),
    //         password: z.string().min(6),
    //         firstName: z.string().min(1),
    //         lastName: z.string().min(1),
    //         phone: z.number(),
    //         user_cc: z.number(),
    //         role: z.enum(ROLES as [string, ...string[]]),
    //     })
    // ).mutation(async ({ input, ctx }) => {

    //     const hashedPassword = await bcrypt.hash(input.password, 10);
    //     const existingUser = await ctx.db.query.user.findFirst({
    //         where: eq(user.email, input.email),
    //     });
    //     if (existingUser) {
    //         throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
    //     }
    // })
});
