import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { and, eq, desc, sql, ilike, or, like, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hospitals, doctors, users, hospitalDoctors, appointments, hospitalJoinRequests } from "../db/schema";
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
            role: "HOSPITAL",
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
    if (ctx.session.user.role !== "HOSPITAL") {
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
      if (ctx.session.user.role !== "HOSPITAL") {
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
      if (ctx.session.user.role !== "HOSPITAL") {
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
  getMyHospital:protectedProcedure
    .query(async ({ ctx }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "DOCTOR") {
        throw new Error("Only doctors can access this endpoint");
      }

      // Get doctor info
      const doctor = await ctx.db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });

      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      // Check if doctor has a hospital connection
      const hospitalConnection = await ctx.db.query.hospitalDoctors.findFirst({
        where: eq(hospitalDoctors.doctorId, doctor.id),
        with: {
          hospital: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      if (!hospitalConnection) {
        return null;
      }

      // Get additional stats
      const totalDoctors = await ctx.db.query.hospitalDoctors.findMany({
        where: eq(hospitalDoctors.hospitalId, hospitalConnection.hospital.id),
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayAppointments = await ctx.db.query.appointments.findMany({
        where: and(
          eq(appointments.hospitalId, hospitalConnection.hospital.id),
          eq(appointments.doctorId, doctor.id),
          gte(appointments.appointmentDate, todayStart),
          lte(appointments.appointmentDate, todayEnd)
        ),
      });

      return {
        hospital: hospitalConnection.hospital,
        joinedAt: hospitalConnection.createdAt,
        totalDoctors: totalDoctors.length,
        totalPatients: 0, // You can calculate this if needed
        todayAppointments: todayAppointments.length,
      };
    }),

  // ============================================
  // GET AVAILABLE HOSPITALS (for doctor to browse)
  // ============================================
   getAvailableHospitals: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;

      if (userRole !== "DOCTOR") {
        throw new Error("Only doctors can access this endpoint");
      }

      let whereConditions : any[] = [
        eq(hospitals.isVerified, true),
        eq(hospitals.status, "active"),
      ];

      if (input.search) {
        whereConditions.push(
          or(
            like(hospitals.name, `%${input?.search ?? ''}%`),
            like(hospitals.address, `%${input?.search ?? ''}%`)
          )
        );
      }

      const availableHospitals = await ctx.db.query.hospitals.findMany({
        where: and(...whereConditions),
        orderBy: [desc(hospitals.createdAt)],
        limit: 50,
      });

      return availableHospitals;
    }),

  // ============================================
  // SEND JOIN REQUEST (doctor to hospital)
  // ============================================
   sendJoinRequest: protectedProcedure
    .input(
      z.object({
        hospitalId: z.number(),
        department: z.string().min(1, "Department is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "DOCTOR") {
        throw new Error("Only doctors can send join requests");
      }

      // Get doctor info
      const doctor = await ctx.db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });

      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      // Check if already connected
      const existingConnection = await ctx.db.query.hospitalDoctors.findFirst({
        where: eq(hospitalDoctors.doctorId, doctor.id),
      });

      if (existingConnection) {
        throw new Error("You are already connected to a hospital");
      }

      // Check if request already exists
      const existingRequest = await ctx.db.query.hospitalJoinRequests.findFirst({
        where: and(
          eq(hospitalJoinRequests.doctorId, doctor.id),
          eq(hospitalJoinRequests.hospitalId, input.hospitalId),
          eq(hospitalJoinRequests.status, "pending")
        ),
      });

      if (existingRequest) {
        throw new Error("You have already sent a request to this hospital");
      }

      // Create join request
      const request = await ctx.db
        .insert(hospitalJoinRequests)
        .values({
          doctorId: doctor.id,
          hospitalId: input.hospitalId,
          department: input.department,
          status: "pending",
        })
        .returning();

      return request[0];
    }),

  // ============================================
  // GET MY HOSPITAL REQUESTS (for doctor)
  // ============================================
  getMyHospitalRequests :protectedProcedure
    .query(async ({ ctx }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "DOCTOR") {
        throw new Error("Only doctors can access this endpoint");
      }

      const doctor = await ctx.db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });

      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      const requests = await ctx.db.query.hospitalJoinRequests.findMany({
        where: and(
          eq(hospitalJoinRequests.doctorId, doctor.id),
          eq(hospitalJoinRequests.status, "pending")
        ),
        with: {
          hospital: true,
        },
        orderBy: [desc(hospitalJoinRequests.createdAt)],
      });

      return requests;
    }),

  // ============================================
  // CANCEL JOIN REQUEST (for doctor)
  // ============================================
   cancelJoinRequest :protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "DOCTOR") {
        throw new Error("Only doctors can cancel requests");
      }

      const doctor = await ctx.db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });

      if (!doctor) {
        throw new Error("Doctor profile not found");
      }

      // Verify request belongs to doctor
      const request = await ctx.db.query.hospitalJoinRequests.findFirst({
        where: and(
          eq(hospitalJoinRequests.id, input.requestId),
          eq(hospitalJoinRequests.doctorId, doctor.id)
        ),
      });

      if (!request) {
        throw new Error("Request not found");
      }

      // Delete the request
      await ctx.db
        .delete(hospitalJoinRequests)
        .where(eq(hospitalJoinRequests.id, input.requestId));

      return { success: true };
    }),

  // ============================================
  // GET PENDING REQUESTS (for hospital admin)
  // ============================================
  getPendingRequests :protectedProcedure
    .query(async ({ ctx }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "HOSPITAL") {
        throw new Error("Only hospital admins can access this endpoint");
      }

      const hospital = await ctx.db.query.hospitals.findFirst({
        where: eq(hospitals.userId, userId),
      });

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      const requests = await ctx.db.query.hospitalJoinRequests.findMany({
        where: and(
          eq(hospitalJoinRequests.hospitalId, hospital.id),
          eq(hospitalJoinRequests.status, "pending")
        ),
        with: {
          doctor: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: [desc(hospitalJoinRequests.createdAt)],
      });

      return requests;
    }),

  // ============================================
  // APPROVE JOIN REQUEST (for hospital admin)
  // ============================================
   approveJoinRequest : protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "HOSPITAL") {
        throw new Error("Only hospital admins can approve requests");
      }

      const hospital = await ctx.db.query.hospitals.findFirst({
        where: eq(hospitals.userId, userId),
      });

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      // Get the request
      const request = await ctx.db.query.hospitalJoinRequests.findFirst({
        where: and(
          eq(hospitalJoinRequests.id, input.requestId),
          eq(hospitalJoinRequests.hospitalId, hospital.id),
          eq(hospitalJoinRequests.status, "pending")
        ),
      });

      if (!request) {
        throw new Error("Request not found");
      }

      // Create hospital-doctor connection
      await ctx.db.insert(hospitalDoctors).values({
        hospitalId: hospital.id,
        doctorId: request.doctorId,
      });

      // Update doctor's hospitalId
      await ctx.db
        .update(doctors)
        .set({ hospitalId: hospital.id })
        .where(eq(doctors.id, request.doctorId));

      // Update request status
      await ctx.db
        .update(hospitalJoinRequests)
        .set({
          status: "approved",
          respondedBy: userId,
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(hospitalJoinRequests.id, input.requestId));

      return { success: true };
    }),

  // ============================================
  // REJECT JOIN REQUEST (for hospital admin)
  // ============================================
  rejectJoinRequest : protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userRole = ctx.session.user.role;
      const userId = ctx.session.user.id;

      if (userRole !== "HOSPITAL") {
        throw new Error("Only hospital admins can reject requests");
      }

      const hospital = await ctx.db.query.hospitals.findFirst({
        where: eq(hospitals.userId, userId),
      });

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      // Update request status
      await ctx.db
        .update(hospitalJoinRequests)
        .set({
          status: "rejected",
          respondedBy: userId,
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(hospitalJoinRequests.id, input.requestId),
          eq(hospitalJoinRequests.hospitalId, hospital.id)
        ));

      return { success: true };
    })
});