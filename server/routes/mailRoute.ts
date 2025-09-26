import { userZod } from "@/lib/validator";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import MailAPI from './mail';
import { z } from "zod";

export const generateMailRouter = createTRPCRouter({
    welcome: publicProcedure
      .input(
        userZod.pick({
          email: true,
          firstName: true,
        })
      )
      .query(async ({ input }) => {
        await MailAPI.welcome(input);
      }),
    verification: publicProcedure
      .input(
        userZod.pick({
          email: true,
          firstName: true,
          emailVerificationToken: true,
        })
      )
      .query(async ({ input }) => {
        await MailAPI.verification(input);
      }),
      sendLoginDetected: protectedProcedure.
        input(z.void()).query(async ({ ctx }) => {
          await MailAPI.loginDetected(ctx.session.user.email as string,ctx.session.user.firstName as string);
        })
  });
  