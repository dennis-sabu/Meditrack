import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { and, eq, desc, sql, gte, lte, between } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  doctors,
  users,
  hospitals,
  appointments,
  patients,
  prescriptions,
  doctorSchedules,
  appointmentSlots
} from "../db/schema";
import bcrypt from "bcrypt";

export const doctorRouter = createTRPCRouter({
  // Doctor Registration
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(10, "Phone number is required"),
        medicalLicenseNumber: z.string().min(5, "Medical license number is required"),
        specialization: z.string().min(2, "Specialization is required"),
        experienceYears: z.number().min(0, "Experience years must be positive"),
        qualifications: z.string().min(10, "Qualifications are required"),
        bio: z.string().optional(),
        consultationFee: z.number().min(0, "Consultation fee must be positive"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if doctor already exists with this license
        const existingDoctor = await ctx.db
          .select()
          .from(doctors)
          .where(eq(doctors.medicalLicenseNumber, input.medicalLicenseNumber))
          .limit(1);

        if (existingDoctor.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Doctor with this medical license already exists",
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

        // Create doctor user
        const [doctorUser] = await ctx.db
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash: hashedPassword,
            phone: input.phone,
            role: "DOCTOR",
            loginType: "Credentials",
            emailVerified: true,
            governmentId: input.medicalLicenseNumber,
          })
          .returning();

        // Create doctor record
        const [doctor] = await ctx.db
          .insert(doctors)
          .values({
            userId: doctorUser.id,
            medicalLicenseNumber: input.medicalLicenseNumber,
            specialization: input.specialization,
            experienceYears: input.experienceYears,
            qualifications: input.qualifications,
            bio: input.bio,
            consultationFee: input.consultationFee.toString(),
            isVerified: false, // Pending verification
            isActive: false,
          })
          .returning();

        return {
          success: true,
          message: "Doctor registration submitted for verification",
          doctor: {
            id: doctor.id,
            name: input.name,
            specialization: input.specialization,
            isVerified: doctor.isVerified,
          },
        };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Doctor registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),

  // Get doctor dashboard data
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "DOCTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    // Get doctor record
    const doctor = await ctx.db
      .select({
        id: doctors.id,
        specialization: doctors.specialization,
        isVerified: doctors.isVerified,
        isActive: doctors.isActive,
        hospitalId: doctors.hospitalId,
        consultationFee: doctors.consultationFee,
        hospitalName: hospitals.name,
      })
      .from(doctors)
      .leftJoin(hospitals, eq(doctors.hospitalId, hospitals.id))
      .where(eq(doctors.userId, Number(ctx.session.user.id)))
      .limit(1);

    if (!doctor[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctor[0].id;

    // Get today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get dashboard statistics
    const [appointmentsToday, appointmentsThisWeek, totalPatients, pendingAppointments] =
      await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.doctorId, doctorId),
              sql`DATE(${appointments.scheduledAt}) = CURRENT_DATE`,
              eq(appointments.status, "CONFIRMED")
            )
          ),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.doctorId, doctorId),
              sql`${appointments.scheduledAt} >= DATE_TRUNC('week', CURRENT_DATE)`,
              sql`${appointments.scheduledAt} < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`
            )
          ),

        ctx.db
          .select({ count: sql<number>`count(DISTINCT ${appointments.patientId})` })
          .from(appointments)
          .where(eq(appointments.doctorId, doctorId)),

        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.doctorId, doctorId),
              eq(appointments.status, "PENDING")
            )
          ),
      ]);

    return {
      doctor: doctor[0],
      stats: {
        appointmentsToday: appointmentsToday[0]?.count || 0,
        appointmentsThisWeek: appointmentsThisWeek[0]?.count || 0,
        totalPatients: totalPatients[0]?.count || 0,
        pendingAppointments: pendingAppointments[0]?.count || 0,
      },
    };
  }),

  // Get doctor appointments
  getAppointments: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.enum(["all", "pending", "confirmed", "completed", "cancelled"]).default("all"),
        date: z.string().optional(), // YYYY-MM-DD format
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const doctor = await ctx.db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!doctor[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor profile not found",
        });
      }

      const offset = (input.page - 1) * input.limit;

      let whereConditions = [eq(appointments.doctorId, doctor[0].id)];

      if (input.status !== "all") {
        whereConditions.push(eq(appointments.status, input.status.toUpperCase()));
      }

      if (input.date) {
        whereConditions.push(sql`DATE(${appointments.scheduledAt}) = ${input.date}`);
      }

      const appointmentsData = await ctx.db
        .select({
          id: appointments.id,
          scheduledAt: appointments.scheduledAt,
          status: appointments.status,
          appointmentType: appointments.appointmentType,
          symptoms: appointments.symptoms,
          notes: appointments.notes,
          fee: appointments.fee,
          paymentStatus: appointments.paymentStatus,
          patientName: users.name,
          patientEmail: users.email,
          patientPhone: users.phone,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(users, eq(patients.userId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(appointments.scheduledAt))
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .where(and(...whereConditions));

      return {
        appointments: appointmentsData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Update appointment status
  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "RESCHEDULED"]),
        notes: z.string().optional(),
        cancelReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const doctor = await ctx.db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!doctor[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor profile not found",
        });
      }

      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.notes) updateData.notes = input.notes;
      if (input.cancelReason) updateData.cancelReason = input.cancelReason;

      const [updatedAppointment] = await ctx.db
        .update(appointments)
        .set(updateData)
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.doctorId, doctor[0].id)
          )
        )
        .returning();

      if (!updatedAppointment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found or unauthorized",
        });
      }

      return {
        success: true,
        message: `Appointment ${input.status.toLowerCase()} successfully`,
        appointment: updatedAppointment,
      };
    }),

  // Get doctor schedule
  getSchedule: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "DOCTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const doctor = await ctx.db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.userId, Number(ctx.session.user.id)))
      .limit(1);

    if (!doctor[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doctor profile not found",
      });
    }

    const schedule = await ctx.db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctor[0].id))
      .orderBy(doctorSchedules.dayOfWeek);

    return { schedule };
  }),

  // Update doctor schedule
  updateSchedule: protectedProcedure
    .input(
      z.object({
        schedules: z.array(
          z.object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            slotDuration: z.number().default(30),
            isActive: z.boolean().default(true),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const doctor = await ctx.db
        .select({ id: doctors.id, hospitalId: doctors.hospitalId })
        .from(doctors)
        .where(eq(doctors.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!doctor[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor profile not found",
        });
      }

      // Delete existing schedule
      await ctx.db
        .delete(doctorSchedules)
        .where(eq(doctorSchedules.doctorId, doctor[0].id));

      // Insert new schedule
      if (input.schedules.length > 0) {
        await ctx.db.insert(doctorSchedules).values(
          input.schedules.map((schedule) => ({
            doctorId: doctor[0].id,
            hospitalId: doctor[0].hospitalId || 0,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            slotDuration: schedule.slotDuration,
            isActive: schedule.isActive,
          }))
        );
      }

      return {
        success: true,
        message: "Schedule updated successfully",
      };
    }),

  // Get doctor patients list
  getPatients: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const doctor = await ctx.db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!doctor[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor profile not found",
        });
      }

      const offset = (input.page - 1) * input.limit;

      const patientsData = await ctx.db
        .select({
          patientId: patients.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          dob: patients.dob,
          gender: patients.gender,
          lastAppointment: sql<Date>`MAX(${appointments.scheduledAt})`,
          totalAppointments: sql<number>`COUNT(${appointments.id})`,
        })
        .from(patients)
        .innerJoin(users, eq(patients.userId, users.id))
        .innerJoin(appointments, eq(patients.id, appointments.patientId))
        .where(eq(appointments.doctorId, doctor[0].id))
        .groupBy(patients.id, users.name, users.email, users.phone, patients.dob, patients.gender)
        .orderBy(sql`MAX(${appointments.scheduledAt}) DESC`)
        .limit(input.limit)
        .offset(offset);

      const totalCount = await ctx.db
        .select({ count: sql<number>`COUNT(DISTINCT ${patients.id})` })
        .from(patients)
        .innerJoin(appointments, eq(patients.id, appointments.patientId))
        .where(eq(appointments.doctorId, doctor[0].id));

      return {
        patients: patientsData,
        total: totalCount[0]?.count || 0,
        page: input.page,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
      };
    }),

  // Get doctor profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== "DOCTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const doctorProfile = await ctx.db
      .select({
        id: doctors.id,
        specialization: doctors.specialization,
        experienceYears: doctors.experienceYears,
        qualifications: doctors.qualifications,
        bio: doctors.bio,
        consultationFee: doctors.consultationFee,
        medicalLicenseNumber: doctors.medicalLicenseNumber,
        isVerified: doctors.isVerified,
        isActive: doctors.isActive,
        hospitalId: doctors.hospitalId,
        hospitalName: hospitals.name,
        name: users.name,
        email: users.email,
        phone: users.phone,
        image: users.image,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(hospitals, eq(doctors.hospitalId, hospitals.id))
      .where(eq(doctors.userId, Number(ctx.session.user.id)))
      .limit(1);

    if (!doctorProfile[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Doctor profile not found",
      });
    }

    return { doctor: doctorProfile[0] };
  }),

  // Update doctor profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().optional(),
        consultationFee: z.number().min(0).optional(),
        qualifications: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "DOCTOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      const doctor = await ctx.db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, Number(ctx.session.user.id)))
        .limit(1);

      if (!doctor[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor profile not found",
        });
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.consultationFee !== undefined) updateData.consultationFee = input.consultationFee.toString();
      if (input.qualifications !== undefined) updateData.qualifications = input.qualifications;

      const [updatedDoctor] = await ctx.db
        .update(doctors)
        .set(updateData)
        .where(eq(doctors.id, doctor[0].id))
        .returning();

      // Update user phone if provided
      if (input.phone) {
        await ctx.db
          .update(users)
          .set({ phone: input.phone, updatedAt: new Date() })
          .where(eq(users.id, Number(ctx.session.user.id)));
      }

      return {
        success: true,
        message: "Profile updated successfully",
        doctor: updatedDoctor,
      };
    }),
});