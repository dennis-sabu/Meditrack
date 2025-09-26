import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { desc, eq, sql, and, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { users, hospitals, doctors, appointments } from "../db/schema";
import bcrypt from "bcrypt";

export const adminRouter = createTRPCRouter({
  // Get admin dashboard data
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Get dashboard statistics
    const [totalHospitals, totalDoctors, pendingHospitals, pendingDoctors, totalAppointments] =
      await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(hospitals)
          .where(eq(hospitals.isActive, true)),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(doctors)
          .where(eq(doctors.isActive, true)),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(hospitals)
          .where(eq(hospitals.isVerified, false)),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(doctors)
          .where(eq(doctors.isVerified, false)),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments),
      ]);

    return {
      stats: {
        totalHospitals: totalHospitals[0]?.count || 0,
        totalDoctors: totalDoctors[0]?.count || 0,
        pendingHospitals: pendingHospitals[0]?.count || 0,
        pendingDoctors: pendingDoctors[0]?.count || 0,
        totalAppointments: totalAppointments[0]?.count || 0,
      },
    };
  }),

  // Get all hospitals for admin management
  getAllHospitals: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(["all", "verified", "pending", "rejected"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let whereConditions = [];

      if (input.search) {
        whereConditions.push(
          sql`(${ilike(hospitals.name, `%${input.search}%`)} OR ${ilike(hospitals.email, `%${input.search}%`)})`
        );
      }

      if (input.status === "verified") {
        whereConditions.push(eq(hospitals.isVerified, true));
      } else if (input.status === "pending") {
        whereConditions.push(eq(hospitals.isVerified, false));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const hospitalsData = await ctx.db
        .select({
          id: hospitals.id,
          name: hospitals.name,
          email: hospitals.email,
          address: hospitals.address,
          contactNumber: hospitals.contactNumber,
          registrationNumber: hospitals.registrationNumber,
          isVerified: hospitals.isVerified,
          isActive: hospitals.isActive,
          createdAt: hospitals.createdAt,
          adminName: users.name,
          adminEmail: users.email,
          adminPhone: users.phone,
        })
        .from(hospitals)
        .leftJoin(users, eq(hospitals.userId, users.id))
        .where(whereClause)
        .orderBy(desc(hospitals.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(hospitals)
        .where(whereClause);

      return {
        hospitals: hospitalsData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Get all doctors for admin management
  getAllDoctors: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(["all", "verified", "pending", "rejected"]).default("all"),
        hospitalId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let whereConditions = [];

      if (input.search) {
        whereConditions.push(
          sql`(${ilike(users.name, `%${input.search}%`)} OR ${ilike(users.email, `%${input.search}%`)})`
        );
      }

      if (input.status === "verified") {
        whereConditions.push(eq(doctors.isVerified, true));
      } else if (input.status === "pending") {
        whereConditions.push(eq(doctors.isVerified, false));
      }

      if (input.hospitalId) {
        whereConditions.push(eq(doctors.hospitalId, input.hospitalId));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const doctorsData = await ctx.db
        .select({
          id: doctors.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          specialization: doctors.specialization,
          experienceYears: doctors.experienceYears,
          medicalLicenseNumber: doctors.medicalLicenseNumber,
          qualifications: doctors.qualifications,
          consultationFee: doctors.consultationFee,
          isVerified: doctors.isVerified,
          isActive: doctors.isActive,
          createdAt: doctors.createdAt,
          hospitalName: hospitals.name,
          hospitalId: doctors.hospitalId,
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .leftJoin(hospitals, eq(doctors.hospitalId, hospitals.id))
        .where(whereClause)
        .orderBy(desc(doctors.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(whereClause);

      return {
        doctors: doctorsData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Verify/approve hospital
  verifyHospital: protectedProcedure
    .input(
      z.object({
        hospitalId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin can verify hospitals",
        });
      }

      const [updatedHospital] = await ctx.db
        .update(hospitals)
        .set({
          isVerified: input.approved,
          isActive: input.approved,
          updatedAt: new Date(),
          createdBy: Number(ctx.session.user.id),
        })
        .where(eq(hospitals.id, input.hospitalId))
        .returning();

      if (!updatedHospital) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hospital not found",
        });
      }

      return {
        success: true,
        message: input.approved
          ? "Hospital verified successfully"
          : "Hospital verification rejected",
      };
    }),

  // Verify/approve doctor
  verifyDoctor: protectedProcedure
    .input(
      z.object({
        doctorId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin can verify doctors",
        });
      }

      const [updatedDoctor] = await ctx.db
        .update(doctors)
        .set({
          isVerified: input.approved,
          isActive: input.approved,
          updatedAt: new Date(),
        })
        .where(eq(doctors.id, input.doctorId))
        .returning();

      if (!updatedDoctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      return {
        success: true,
        message: input.approved
          ? "Doctor verified successfully"
          : "Doctor verification rejected",
      };
    }),

  // Suspend/unsuspend hospital
  toggleHospitalStatus: protectedProcedure
    .input(
      z.object({
        hospitalId: z.number(),
        active: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [updatedHospital] = await ctx.db
        .update(hospitals)
        .set({
          isActive: input.active,
          updatedAt: new Date(),
        })
        .where(eq(hospitals.id, input.hospitalId))
        .returning();

      if (!updatedHospital) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hospital not found",
        });
      }

      return {
        success: true,
        message: input.active
          ? "Hospital activated successfully"
          : "Hospital suspended successfully",
      };
    }),

  // Suspend/unsuspend doctor
  toggleDoctorStatus: protectedProcedure
    .input(
      z.object({
        doctorId: z.number(),
        active: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const [updatedDoctor] = await ctx.db
        .update(doctors)
        .set({
          isActive: input.active,
          updatedAt: new Date(),
        })
        .where(eq(doctors.id, input.doctorId))
        .returning();

      if (!updatedDoctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      return {
        success: true,
        message: input.active
          ? "Doctor activated successfully"
          : "Doctor suspended successfully",
      };
    }),

  // Get system users (admins, hospital admins)
  getAllUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        role: z.enum(["all", "ADMIN", "HOSPITAL_ADMIN", "DOCTOR"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let whereConditions = [];

      if (input.search) {
        whereConditions.push(
          sql`(${ilike(users.name, `%${input.search}%`)} OR ${ilike(users.email, `%${input.search}%`)})`
        );
      }

      if (input.role !== "all") {
        whereConditions.push(eq(users.role, input.role));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const usersData = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          loginType: users.loginType,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);

      return {
        users: usersData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Create admin user
  createAdmin: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // if (ctx.session?.user?.role !== "SUPER_ADMIN") {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "Access denied",
      //   });
      // }

      // Check if email already exists
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [newAdmin] = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: hashedPassword,
          phone: input.phone || null,
          role: "SUPER_ADMIN",
          loginType: "Credentials",
          emailVerified: true,
          isActive: true,
        })
        .returning();

      return {
        success: true,
        message: "Admin user created successfully",
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      };
    }),
});


// z.object({
//     email: z.string().email(),
//     password: z.string().min(6),
//     confirmPassword: z.string().min(6),
//     firstName: z.string().min(1),
//     lastName: z.string().min(1),
//     phone: z.number(),
//     user_cc: z.number(),
//     role: z.enum(ROLES as [string, ...string[]]),
// })
//     .refine((data) => data.password === data.confirmPassword, {
//         message: "Passwords do not match",
//         path: ["confirmPassword"], // Assign error to confirmPassword field
//     })