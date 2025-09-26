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
export const authRouter = createTRPCRouter({
  /* 🔹 Register Hospital Admin */
  registerHospitalAdmin: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        contactNumber: z.string().min(10),
        address: z.string().min(10),
        registrationNumber: z.string().min(5),
        hospitalName: z.string().min(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingHospital = await db.query.hospitals.findFirst({
        where: eq(hospitals.registrationNumber, input.registrationNumber),
      });
      if (existingHospital) {
        throw new TRPCError({ code: "CONFLICT", message: "Hospital already exists" });
      }

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [hospitalAdmin] = await ctx.db
        .insert(users)
        .values({
          name: `${input.name} - Admin`,
          email: `${input.email}`,
          passwordHash: `${hashedPassword}`,
          role: "HOSPITAL",
          loginType: "Credentials",
          isVerified: false,
          isActive: false,
          emailVerified: true,
        })
        .returning();

      const [hospital] = await db
        .insert(hospitals)
        .values({
          name: `${input.hospitalName}`,
          email: `${input.email}`,
          userId: hospitalAdmin.id,
          address: `${input.address}`,
          registrationNumber: `${input.registrationNumber}`,
          isVerified: false,
          contactNumber: `${input.contactNumber}`,
        })
        .returning();

      return {
        success: true,
        message: "Hospital registration submitted for ADMIN approval",
        hospital,
      };
    }),
  verifyLogin: publicProcedure.
    input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const credentials = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(input);
      if (!credentials.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input" });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.email, credentials.data.email),
      });
      if (user?.role == "HOSPITAL_ADMIN") {
        const hospitalAdmin = await db.query.hospitals.findFirst({
          where:
            eq(hospitals.userId, user.id)
        });
        if (!hospitalAdmin?.isVerified) {
          return {
            message: "Account pending approval",
            data: false,
          };
        } else if (!hospitalAdmin.isActive) {
          return {
            message: "Account is inactive. Contact support.",
            data: false,
          };
        } else {
          const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
          if (!passwordMatch) {
            return {
              message: "Invalid Credentials",
              data: false
            }
          } else {
            return {
              message: "Account verified",
              data: true,
            };
          }
        }
      } else if (user?.role == "DOCTOR") {
        const doctor = await db.query.doctors.findFirst({
          where:
            eq(doctors.userId, user.id)
        });
        if (!doctor?.isVerified) {
          return {
            message: "Account pending approval",
            data: false,
          };
        }
        else if (!doctor.isActive) {
          return {
            message: "Account is inactive. Contact support.",
            data: false,
          };
        } else {
          const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
          if (!passwordMatch) {
            return {
              message: "Invalid Credentials",
              data: false
            }
          } else {
            return {
              message: "Account verified",
              data: true,
            };
          }
        }
      } else {
        return {
          message: "Account not authorized",
          data: false,
        };
      }
    }),
  /* 🔹 Register Doctor */
  registerDoctor: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        medicalLicenseNumber: z.string().min(5),
        specialization: z.string().min(2),
        experienceYears: z.number().optional(),
        qualifications: z.string().min(3),
        bio: z.string().optional(),
        consultationFee: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existingDoctor = await db.query.doctors.findFirst({
        where: eq(doctors.medicalLicenseNumber, input.medicalLicenseNumber),
      });
      if (existingDoctor) {
        throw new TRPCError({ code: "CONFLICT", message: "Doctor already exists" });
      }

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [doctorUser] = await db
        .insert(users)
        .values({
          name: `${input.name}`,
          email: `${input.email}`,
          passwordHash: `${hashedPassword}`,
          role: "DOCTOR",
          loginType: "Credentials",
          isVerified: false,
          isActive: false,
          emailVerified: true,
        })
        .returning();

      const [doctor] = await db
        .insert(doctors)
        .values({
          userId: doctorUser.id,
          medicalLicenseNumber: input.medicalLicenseNumber,
          specialization: input.specialization,
          experienceYears: input.experienceYears ?? 0,
          qualifications: input.qualifications,
          bio: input.bio,
          consultationFee: input.consultationFee?.toString() ?? "0",
          isVerified: false,
          isActive: false,
        })
        .returning();

      return {
        success: true,
        message: "Doctor registration submitted for ADMIN approval",
        doctor,
      };
    }),

  /* 🔹 Patient Registration */
  registerPatient: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        dateOfBirth: z.string().optional(),
        governmentId: z.string().optional(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      await db.insert(users).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: hashedPassword,
        role: "PATIENT",
        loginType: "Credentials",
        emailVerified: true,
        isVerified: true, // Patients are auto-verified
      });

      return { success: true, message: "Patient registered successfully" };
    }),

  /* 🔹 Login (only verified Super Admin, Hospital Admin, Doctors) */
  login: publicProcedure
    .input(z.object({ email: z.string(), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const u = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const passwordMatch = await bcrypt.compare(input.password, u.passwordHash);
      if (!passwordMatch) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }

      if (u.role !== "ADMIN" && !u.isVerified) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account pending approval" });
      }

      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, u.id));

      return { message: "Login successful", user: u };
    }),

  /* 🔹 ADMIN: Verify Hospital */
  verifyHospital: protectedProcedure
    .input(z.object({ hospitalId: z.number(), approve: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, Number(ctx.session.user.id)),
      });
      if (!admin || admin.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Super Admin can verify hospitals" });
      }

      await db
        .update(hospitals)
        .set({ isVerified: input.approve })
        .where(eq(hospitals.id, input.hospitalId));

      return { success: true, message: "Hospital verification updated" };
    }),

  /* 🔹 ADMIN: Verify Doctor */
  verifyDoctor: protectedProcedure
    .input(z.object({ doctorId: z.number(), approve: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const admin = await db.query.users.findFirst({
        where: eq(users.id, Number(ctx.session.user.id)),
      });
      if (!admin || admin.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Super Admin can verify doctors" });
      }

      await db
        .update(doctors)
        .set({ isVerified: input.approve })
        .where(eq(doctors.id, input.doctorId));

      await db
        .update(users)
        .set({ isVerified: input.approve })
        .where(eq(users.id, (await db.query.doctors.findFirst({ where: eq(doctors.id, input.doctorId) }))?.userId ?? 0));

      return { success: true, message: "Doctor verification updated" };
    }),
});
