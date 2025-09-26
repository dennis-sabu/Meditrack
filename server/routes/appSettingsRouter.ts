// server/api/routers/appSettings.ts
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";
import { eq, ilike } from "drizzle-orm";
import { appSettings } from "../db/schema";
import { BIBLIYA_SETTINGS, BiblyaSettingsType } from "@/constants/extra";

export const appSettingsRouter = createTRPCRouter({
    // Get settings by section
    getSettingsbyID: publicProcedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
            // Check if the setting exists in DB
            const existing = await db.query.appSettings.findFirst({
                where: eq(appSettings.section, input),
            });

            // If it exists, return the stored value
            if (existing) return existing.value;

            // If it does not exist, check if we have a default for it
            const defaultValue = BIBLIYA_SETTINGS[input as keyof typeof BIBLIYA_SETTINGS];

            if (defaultValue) {
                // Insert the default into the DB
                await db.insert(appSettings).values({
                    section: input,
                    value: defaultValue,
                });

                return defaultValue;
            }

            // No default found
            return null;
        }),
    getSettingsBySection: publicProcedure.
        input(z.object({
            section: z.string()
        })).query(async ({ input, ctx }) => {
            const prefix = input.section;
            const existing = await ctx.db.query.appSettings.findMany({
                where: ilike(appSettings.section, `${prefix}%`),
            });
            const matchingDefaults = Object.entries(BIBLIYA_SETTINGS).filter(([key]) =>
                key.startsWith(prefix),
            );
            if (existing.length === matchingDefaults.length) {
                return existing.map((e, index) => {
                    return {
                        ...e,
                        value: e.value as unknown as BiblyaSettingsType<any>
                    }
                })
            }
            if (matchingDefaults.length > 0) {
                var valuesToInsert = matchingDefaults.map(([section, value]) => ({
                    section,
                    value,
                }));
                matchingDefaults.forEach(async (match) => {
                    const dr = await ctx.db.query.appSettings.findFirst({
                        where: eq(appSettings.section, match[0])
                    })
                    if (!dr){
                        await ctx.db.insert(appSettings).values({
                            section: match[0],
                            value: match[1]
                        });
                    }else{
                        var index = valuesToInsert.findIndex((val)=>val.section==dr.section);
                        valuesToInsert[index]
                    }
                })
                return valuesToInsert;
            }
            return null;
        }),
    // Update settings by section
    updateSettingsByID: protectedProcedure
        .input(
            z.object({
                section: z.string(),
                value: z.record(z.any()), // JSON structure
            })
        )
        .mutation(async ({ input }) => {
            const existing = await db
                .select()
                .from(appSettings)
                .where(eq(appSettings.section, input.section));

            if (existing.length > 0) {
                const u = await db
                    .update(appSettings)
                    .set({
                        value: input.value,
                        updatedAt: new Date(),
                    })
                    .where(eq(appSettings.section, input.section)).returning();
                return u;
            } else {
                const u = await db.insert(appSettings).values({
                    section: input.section,
                    value: input.value,
                    updatedAt: new Date(),
                }).returning();
                return u;

            }

            return { success: true };
        }),
});
