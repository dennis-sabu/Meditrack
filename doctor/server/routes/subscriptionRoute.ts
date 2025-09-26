import { z } from "zod";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../api/trpc";
import { eq } from "drizzle-orm";
import { subscriptions, user } from "../db/schema";
import crypto from 'crypto'
import { razorpay } from "@/utils/razorpay";
const SubscriptionPlanEnum = z.enum(["Basic", "Pro", "Enterprise"]);

export const subscriptionRouter = createTRPCRouter({
    createOrder: protectedProcedure.input(z.object({
        amount: z.number(),
        currency: z.string().default("INR"),
    })).mutation(async ({ ctx, input }) => {
        try {
            const options = {
                amount: input.amount * 100, // Convert to paise
                currency: input.currency,
                receipt: `receipt_${Date.now()}`,
                payment_capture: 1, // Auto-capture
            };

            const order = await razorpay.orders.create(options);
            return { success: true, order };
        } catch (error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error creating order" });
        }
    }),

    // ✅ Verify Payment
    verifyPayment: protectedProcedure.
        input(z.object({
            razorpay_order_id: z.string(),
            razorpay_payment_id: z.string(),
            razorpay_signature: z.string(),
        })).mutation(({ ctx, input }) => {
            try {
                const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

                // Validate Signature
                const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
                hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
                const expectedSignature = hmac.digest("hex");

                if (expectedSignature !== razorpay_signature) {
                    throw new TRPCError({ code: "BAD_REQUEST", message: "Payment verification failed" });
                }

                // ✅ Save payment details in DB (Example)
                // await savePaymentToDB({ orderId: razorpay_order_id, paymentId: razorpay_payment_id });

                return { success: true, message: "Payment verified successfully" };
            } catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error verifying payment" });
            }
        }),
    // Subscribe to a Plan
    subscribe: protectedProcedure
        .input(z.object({
            plan: SubscriptionPlanEnum,
            durationMonths: z.number().min(1).max(24), // Subscription duration (1-24 months)
        }))
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            // Check if user already has an active subscription
            const existingSub = await db.query.subscriptions.findFirst({
                where: (sub) => eq(sub.userId, userId),
            });

            if (existingSub && existingSub.status === "ACTIVE") {
                throw new TRPCError({ code: "CONFLICT", message: "You already have an active subscription." });
            }

            // Calculate end date
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + input.durationMonths);

            // Create subscription
            const newSubscription = await db.insert(subscriptions).values({
                userId,
                planId: 0,
                status: "ACTIVE",
                startedAt: new Date(),
                expiresAt,
            }).returning();

            // Update user payment status
            await db.update(user)
                .set({ paymentStatus: "ACTIVE" })
                .where(eq(user.id, userId));

            return { message: "Subscription activated successfully", subscription: newSubscription };
        }),

    //Check Subscription Status
    getStatus: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const subscription = await db.query.subscriptions.findFirst({
                where: (sub) => eq(sub.userId, userId),
            });

            if (!subscription) {
                return { status: "NO_SUBSCRIPTION" };
            }

            return {
                status: subscription.status,
                plan: subscription.planId,
                startDate: subscription.startedAt,
                // endDate: subscription.,
            };
        }),

    // Cancel Subscription
    cancelSubscription: protectedProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.session.user.id;

            const subscriptionnew = await db.query.subscriptions.findFirst({
                where: (sub) => eq(sub.userId, userId),
            });

            if (!subscriptions) {
                throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription found" });
            }

            // Mark as expired
            await db.update(subscriptions)
                .set({ status: "EXPIRED", expiresAt: new Date() })
                .where(eq(subscriptions.userId, userId));

            // Update user payment status
            await db.update(user)
                .set({ paymentStatus: "EXPIRED" })
                .where(eq(user.id, userId));

            return { message: "Subscription cancelled successfully" };
        }),

    // Admin: Update User Subscription
    updateSubscription: protectedProcedure
        .input(z.object({
            userId: z.string().uuid(),
            status: z.enum(["ACTIVE", "EXPIRED"]),
            plan: z.number().optional(),
            durationMonths: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
            const subscription = await db.query.subscriptions.findFirst({
                where: (sub) => eq(sub.userId, input.userId),
            });

            if (!subscription) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
            }

            let newEndDate = subscription.expiresAt;
            if (input.durationMonths) {
                newEndDate = new Date(subscription.expiresAt);
                newEndDate.setMonth(newEndDate.getMonth() + input.durationMonths);
            }

            // Update subscription
            await db.update(subscriptions)
                .set({
                    status: input.status,
                    planId: input.plan ?? subscription.planId,
                    expiresAt: newEndDate,
                    updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, input.userId));

            return { message: "Subscription updated successfully" };
        }),
});
