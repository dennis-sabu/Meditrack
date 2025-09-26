import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { and, eq, desc, sql, ilike } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hospitals, doctors, users, hospitalDoctors, appointments } from "../db/schema";
import bcrypt from "bcrypt";

export const hospitalRouter = createTRPCRouter({
  // Hospital Registration (for Hospital Admin signup)
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Hospital name is required"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        contactNumber: z.string().min(10, "Contact number is required"),
        address: z.string().min(10, "Address is required"),
        registrationNumber: z.string().min(5, "Registration number is required"),
        adminName: z.string().min(2, "Admin name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if hospital already exists
        const existingHospital = await ctx.db
          .select()
          .from(hospitals)
          .where(eq(hospitals.registrationNumber, input.registrationNumber))
          .limit(1);

        if (existingHospital.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Hospital with this registration number already exists",
          });
        }

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

        // Create hospital admin user
        const [hospitalAdmin] = await ctx.db
          .insert(users)
          .values({
            name: input.adminName,
            email: input.email,
            passwordHash: hashedPassword,
            phone: input.contactNumber,
            role: "HOSPITAL_ADMIN",
            loginType: "Credentials",
            emailVerified: true,
          })
          .returning();

        // Create hospital record
        const [hospital] = await ctx.db
          .insert(hospitals)
          .values({
            name: input.name,
            userId: hospitalAdmin.id,
            email: input.email,
            address: input.address,
            // contactNumber: input.contactNumber,
            registrationNumber: input.registrationNumber,
            // adminId: hospitalAdmin.id,
            isVerified: false, // Pending admin approval
          })
          .returning();

        return {
          success: true,
          message: "Hospital registration submitted for admin approval",
          hospital: {
            id: hospital.id,
            name: hospital.name,
            isVerified: hospital.isVerified,
          },
        };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Hospital registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),

  // Get all hospitals (for admin)
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
        status: z.enum(["all", "verified", "pending"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only allow admin to view all hospitals
      if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let whereClause = sql`1=1`;

      if (input.search) {
        whereClause = sql`${whereClause} AND (${ilike(hospitals.name, `%${input.search}%`)} OR ${ilike(hospitals.email, `%${input.search}%`)})`;
      }

      if (input.status !== "all") {
        const isVerified = input.status === "verified";
        whereClause = sql`${whereClause} AND ${eq(hospitals.isVerified, isVerified)}`;
      }

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

  // Verify hospital (admin only)
  verify: protectedProcedure
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
        })
        .where(eq(hospitals.id, input.hospitalId))
        .returning();

      if (!updatedHospital) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hospital not found",
        });
      }

      // TODO: Send notification to hospital admin

      return {
        success: true,
        message: input.approved
          ? "Hospital verified successfully"
          : "Hospital verification rejected",
      };
    }),

  // Get hospital dashboard data (for hospital admin)
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "HOSPITAL_ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Get hospital for this admin
    const hospital = await ctx.db
      .select()
      .from(hospitals)
      .where(eq(hospitals.userId, Number(ctx.session.user.id)))
      .limit(1);

    if (!hospital[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Hospital not found",
      });
    }

    const hospitalId = hospital[0].id;

    // Get dashboard statistics
    const [doctorsCount, appointmentsToday, pendingDoctors, totalAppointments] =
      await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(doctors)
          .where(and(eq(doctors.hospitalId, hospitalId), eq(doctors.isActive, true))),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.hospitalId, hospitalId),
              sql`DATE(${appointments.appointmentDate}) = CURRENT_DATE`
            )
          ),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(hospitalDoctors)
          .where(and(
            eq(hospitalDoctors.hospitalId, hospitalId),
          )),



        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(eq(appointments.hospitalId, hospitalId)),
      ]);

    return {
      hospital: hospital[0],
      stats: {
        doctorsCount: doctorsCount[0]?.count || 0,
        appointmentsToday: appointmentsToday[0]?.count || 0,
        pendingDoctors: pendingDoctors[0]?.count || 0,
        totalAppointments: totalAppointments[0]?.count || 0,
      },
    };
  }),

  // Get hospital doctors (for hospital admin)
  getDoctors: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.enum(["all", "active", "pending", "suspended"]).default("all"),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "HOSPITAL_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Get hospital for this admin
      const hospital = await ctx.db
        .select({ id: hospitals.id })
        .from(hospitals)
        .where(eq(hospitals.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!hospital[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hospital not found",
        });
      }

      const offset = (input.page - 1) * input.limit;

      const doctorsData = await ctx.db
        .select({
          id: doctors.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          specialization: doctors.specialization,
          experienceYears: doctors.experienceYears,
          medicalLicenseNumber: doctors.medicalLicenseNumber,
          isVerified: doctors.isVerified,
          isActive: doctors.isActive,
          createdAt: doctors.createdAt,
          consultationFee: doctors.consultationFee,
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(doctors.hospitalId, hospital[0].id))
        .orderBy(desc(doctors.createdAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(doctors)
        .where(eq(doctors.hospitalId, hospital[0].id));

      return {
        doctors: doctorsData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Verify/manage doctor (hospital admin)
  verifyDoctor: protectedProcedure
    .input(
      z.object({
        doctorId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "HOSPITAL_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only hospital admin can verify doctors",
        });
      }

      // Verify this doctor belongs to the admin's hospital
      const hospital = await ctx.db
        .select({ id: hospitals.id })
        .from(hospitals)
        .where(eq(hospitals.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!hospital[0]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Hospital not found",
        });
      }

      const [updatedDoctor] = await ctx.db
        .update(doctors)
        .set({
          isVerified: input.approved,
          isActive: input.approved,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(doctors.id, input.doctorId),
            eq(doctors.hospitalId, hospital[0].id)
          )
        )
        .returning();

      if (!updatedDoctor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found or unauthorized",
        });
      }

      return {
        success: true,
        message: input.approved
          ? "Doctor verified successfully"
          : "Doctor verification rejected",
      };
    }),
});