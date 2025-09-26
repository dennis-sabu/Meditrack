import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../api/trpc";
import { api } from "@/utils/server";
import { payments, razorpayOrdersTable, videoBookRequests } from "../db/schema";
import { OrderBody } from "@/types";
import { eq } from "drizzle-orm";
import { triedAsync } from "@/lib/utils";
import { TRPCError } from "@trpc/server";

export const paymentRouter = createTRPCRouter({
    createOrder: protectedProcedure.
        input(z.object({
            amount: z.number(),
            currency: z.string().optional()
        })).mutation(async ({ ctx, input }) => {
            try {
                const razorpay = ctx.razorpay;
                const { amount, currency } = input;
                const user = ctx.session.user;
                if (!amount) {
                    throw new Error("Amount is required");
                }
                if (!user) {
                    throw new Error("User not found");
                }
                const u = await api.userRouter.getUser();
                const options = {
                    amount: amount * 100,
                    currency: currency || "INR",
                    receipt: `receipt#${Date.now()}`,
                };
                const order = await  triedAsync(razorpay.orders.create(options))
                if(!order.isSuccess) throw new TRPCError({message:"Error in Creating order",code:'INTERNAL_SERVER_ERROR'})
                console.log("Order Created Successfully");
                const cp = await ctx.db.insert(razorpayOrdersTable).values({
                    amount,
                    currency: currency || "INR",
                    userId: user.id,
                    status: "created",
                    orderId: order.data.id,
                }).returning();
                return { orderId: order.data.id };
            } catch (error) {
                console.error("Error creating order:", error);
                throw new Error("Failed to create order");
            }
        }),
    completeVideoBookRequest: protectedProcedure.
        input(z.object({
            paymentId: z.string(),
            signature: z.string(),
            razorpayOrderId: z.string()
        })).mutation(async ({ ctx, input }) => {
            try {
                const { paymentId, signature, razorpayOrderId } = input;
                const cp = await triedAsync(ctx.db.update(razorpayOrdersTable).set({
                    paymentId,
                    signature,
                    status: "completed",
                    updatedAt: new Date(),
                }).where(eq(razorpayOrdersTable.orderId, razorpayOrderId)).returning());
                if(!cp.isSuccess || cp.data.length == 0){
                    throw new TRPCError({message:"Payment verification failed",code:"INTERNAL_SERVER_ERROR"})
                }
                const paymentAdded = await triedAsync(ctx.db.insert(payments).values({
                    orderId: cp.data[0]?.id ??'',
                    method:"RAZORPAY",
                    transactionId: paymentId,
                    type:'VIDEOBOOK'
                }).returning());
                if(!paymentAdded.isSuccess){
                    throw new TRPCError({message:"Payment verification failed (adding payments)",code:"INTERNAL_SERVER_ERROR"})
                }
                const p = await triedAsync(ctx.db.update(videoBookRequests).set({
                    paymentId: paymentAdded?.data[0]?.id ?? '',
                    requestStatus:'PENDING'
                }).where(eq(videoBookRequests.userId,ctx.user.id)));
                if(p){
                    return { success: true }
                }
                return { success: false };
            } catch (error) {
                console.error("Error completing order:", error);
                throw new Error("Failed to complete order");
            }
        })
});
