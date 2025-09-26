import { and, eq, gte } from "drizzle-orm";
import { activityLogTable, ActivityLogTypeEnum, ActivityTypeEnum, user } from "@/server/db/schema"; // update path if needed
import { Session } from "next-auth";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import Razorpay from "razorpay";
import * as schema from "@/server/db/schema"
export async function logUserActivityOncePerHour({
    ctx,
    activity,
    type,
    entityKey = "",
    entityValue = "",
}: {
    ctx: {
        session: Session | null;
        headers: Headers;
        db: NodePgDatabase<typeof schema> & {
            $client: Pool;
        };
        razorpay: Razorpay;
    }
    activity: typeof ActivityTypeEnum.enumValues[number];
    type: typeof ActivityLogTypeEnum.enumValues[number];
    entityKey?: string;
    entityValue?: string;
}) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!ctx.session) {
        return;
    }
    const s = await ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.session?.user?.id ?? '')
    })
    if (!s) return;
    const alreadyLogged = await ctx.db.query.activityLogTable.findFirst({
        where: and(
            eq(activityLogTable.userId, s.id),
            eq(activityLogTable.activity, activity as typeof ActivityTypeEnum.enumValues[number]),
            eq(activityLogTable.type, type as typeof ActivityLogTypeEnum.enumValues[number]),
            eq(activityLogTable.entityKey, entityKey),
            eq(activityLogTable.entityValue, entityValue),
            gte(activityLogTable.createdAt, oneHourAgo)
        )
    });

    if (!alreadyLogged && s) {
        await ctx.db.insert(activityLogTable).values({
            activity: activity as typeof ActivityTypeEnum.enumValues[number],
            type: type as typeof ActivityLogTypeEnum.enumValues[number],
            userId: s.id,
            entityKey: entityKey,
            entityValue: entityValue,
        });
    }
}
