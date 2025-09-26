import { appSettings } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const getSetting = async ({ ctx, value }: { ctx: any, value: string }) => {
    const set = await ctx.db.query.appSettings.findFirst({
        where: eq(appSettings.section, value)
    })
    if (!set) return null;
    return set?.value as any;
}