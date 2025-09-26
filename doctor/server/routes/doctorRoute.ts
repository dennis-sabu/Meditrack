import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { eq, and } from "drizzle-orm";
import bcrypt, { compare } from "bcrypt";
import { db } from "../db";
import { users, hospitals, doctors } from "../db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { env } from "@/env";

/* ------------------ AUTH ROUTER ------------------ */
export const doctorRouter = createTRPCRouter({
    
})