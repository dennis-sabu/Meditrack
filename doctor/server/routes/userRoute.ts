import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { eq, and, sql, desc, asc, or, like, gte, lte } from "drizzle-orm";
import bcrypt, { compare } from "bcrypt";
import { db } from "../db";
import { users, hospitals, doctors, appointments, patients, consultations, payments, hospitalDoctors, healthMetrics, doctorAvailability, videoBookRequests } from "../db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { env } from "@/env";

/* ------------------ AUTH ROUTER ------------------ */
export const userRouter = createTRPCRouter({
    getDashboardData: protectedProcedure
        .query(async ({ ctx }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;

            // Base stats accessible to all roles
            const baseStats = {
                totalUsers: 0,
                totalHospitals: 0,
                totalDoctors: 0,
                totalPatients: 0,
                totalAppointments: 0,
                pendingAppointments: 0,
                completedAppointments: 0,
                totalConsultations: 0,
                totalRevenue: 0,
                recentAppointments: [],
                recentConsultations: [],
            };

            // ADMIN Dashboard
            if (userRole === "ADMIN") {
                const [
                    totalUsers,
                    totalHospitals,
                    verifiedHospitals,
                    pendingHospitals,
                    totalDoctors,
                    verifiedDoctors,
                    pendingDoctors,
                    totalPatients,
                    totalAppointments,
                    appointmentsByStatus,
                    totalConsultations,
                    recentHospitals,
                    recentDoctors,
                    recentAppointments,
                    totalRevenue,
                    recentPayments,
                ] = await Promise.all([
                    // Total users count
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(users)
                        .then((r) => r[0]?.count || 0),

                    // Total hospitals
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(hospitals)
                        .then((r) => r[0]?.count || 0),

                    // Verified hospitals
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(hospitals)
                        .where(eq(hospitals.isVerified, true))
                        .then((r) => r[0]?.count || 0),

                    // Pending hospitals
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(hospitals)
                        .where(eq(hospitals.status, "pending"))
                        .then((r) => r[0]?.count || 0),

                    // Total doctors
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(doctors)
                        .then((r) => r[0]?.count || 0),

                    // Verified doctors
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(doctors)
                        .where(eq(doctors.isVerified, true))
                        .then((r) => r[0]?.count || 0),

                    // Pending doctors
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(doctors)
                        .where(eq(doctors.status, "pending"))
                        .then((r) => r[0]?.count || 0),

                    // Total patients
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(patients)
                        .then((r) => r[0]?.count || 0),

                    // Total appointments
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .then((r) => r[0]?.count || 0),

                    // Appointments by status
                    ctx.db
                        .select({
                            status: appointments.status,
                            count: sql<number>`count(*)`,
                        })
                        .from(appointments)
                        .groupBy(appointments.status),

                    // Total consultations
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(consultations)
                        .then((r) => r[0]?.count || 0),

                    // Recent hospitals (last 5)
                    ctx.db
                        .select({
                            id: hospitals.id,
                            name: hospitals.name,
                            email: hospitals.email,
                            status: hospitals.status,
                            isVerified: hospitals.isVerified,
                            createdAt: hospitals.createdAt,
                        })
                        .from(hospitals)
                        .orderBy(desc(hospitals.createdAt))
                        .limit(5),

                    // Recent doctors (last 5)
                    ctx.db
                        .select({
                            id: doctors.id,
                            name: users.name,
                            email: users.email,
                            specialization: doctors.specialization,
                            status: doctors.status,
                            isVerified: doctors.isVerified,
                            createdAt: doctors.createdAt,
                        })
                        .from(doctors)
                        .leftJoin(users, eq(doctors.userId, users.id))
                        .orderBy(desc(doctors.createdAt))
                        .limit(5),

                    // Recent appointments (last 10)
                    ctx.db
                        .select({
                            id: appointments.id,
                            appointmentDate: appointments.appointmentDate,
                            status: appointments.status,
                            patientName: sql<string>`patient_user.name`,
                            doctorName: sql<string>`doctor_user.name`,
                            hospitalName: hospitals.name,
                            createdAt: appointments.createdAt,
                        })
                        .from(appointments)
                        .leftJoin(patients, eq(appointments.patientId, patients.id))
                        .leftJoin(
                            sql`users as patient_user`,
                            sql`patient_user.id = ${patients.userId}`
                        )
                        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
                        .leftJoin(
                            sql`users as doctor_user`,
                            sql`doctor_user.id = ${doctors.userId}`
                        )
                        .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
                        .orderBy(desc(appointments.createdAt))
                        .limit(10),

                    // Total revenue
                    ctx.db
                        .select({
                            total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
                        })
                        .from(payments)
                        .where(eq(payments.status, "success"))
                        .then((r) => r[0]?.total || 0),

                    // Recent payments
                    ctx.db
                        .select({
                            id: payments.id,
                            amount: payments.amount,
                            type: payments.type,
                            status: payments.status,
                            method: payments.method,
                            createdAt: payments.createdAt,
                        })
                        .from(payments)
                        .orderBy(desc(payments.createdAt))
                        .limit(10),
                ]);

                const appointmentStats = appointmentsByStatus.reduce(
                    (acc, curr) => {
                        acc[curr.status?.toLowerCase() || "unknown"] = curr.count;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                return {
                    totalUsers,
                    totalHospitals,
                    verifiedHospitals,
                    pendingHospitals,
                    totalDoctors,
                    verifiedDoctors,
                    pendingDoctors,
                    totalPatients,
                    totalAppointments,
                    pendingAppointments: appointmentStats.pending || 0,
                    confirmedAppointments: appointmentStats.confirmed || 0,
                    completedAppointments: appointmentStats.completed || 0,
                    cancelledAppointments: appointmentStats.cancelled || 0,
                    totalConsultations,
                    totalRevenue,
                    recentHospitals,
                    recentDoctors,
                    recentAppointments,
                    recentPayments,
                };
            }

            // HOSPITAL Dashboard
            if (userRole === "HOSPITAL") {
                // Find hospital for this user
                const hospital = await ctx.db
                    .select({ id: hospitals.id })
                    .from(hospitals)
                    .where(eq(hospitals.userId, userId))
                    .limit(1)
                    .then((r) => r[0]);

                if (!hospital) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Hospital not found",
                    });
                }

                const [
                    totalDoctors,
                    activeDoctors,
                    totalAppointments,
                    appointmentsByStatus,
                    totalPatients,
                    recentAppointments,
                    recentDoctors,
                ] = await Promise.all([
                    // Total doctors in this hospital
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(hospitalDoctors)
                        .where(eq(hospitalDoctors.hospitalId, hospital.id))
                        .then((r) => r[0]?.count || 0),

                    // Active doctors
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(hospitalDoctors)
                        .leftJoin(doctors, eq(hospitalDoctors.doctorId, doctors.id))
                        .where(
                            and(
                                eq(hospitalDoctors.hospitalId, hospital.id),
                                eq(doctors.isActive, true)
                            )
                        )
                        .then((r) => r[0]?.count || 0),

                    // Total appointments at this hospital
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(eq(appointments.hospitalId, hospital.id))
                        .then((r) => r[0]?.count || 0),

                    // Appointments by status
                    ctx.db
                        .select({
                            status: appointments.status,
                            count: sql<number>`count(*)`,
                        })
                        .from(appointments)
                        .where(eq(appointments.hospitalId, hospital.id))
                        .groupBy(appointments.status),

                    // Unique patients
                    ctx.db
                        .select({ count: sql<number>`count(DISTINCT ${appointments.patientId})` })
                        .from(appointments)
                        .where(eq(appointments.hospitalId, hospital.id))
                        .then((r) => r[0]?.count || 0),

                    // Recent appointments
                    ctx.db
                        .select({
                            id: appointments.id,
                            appointmentDate: appointments.appointmentDate,
                            status: appointments.status,
                            patientName: sql<string>`patient_user.name`,
                            doctorName: sql<string>`doctor_user.name`,
                            createdAt: appointments.createdAt,
                        })
                        .from(appointments)
                        .leftJoin(patients, eq(appointments.patientId, patients.id))
                        .leftJoin(
                            sql`users as patient_user`,
                            sql`patient_user.id = ${patients.userId}`
                        )
                        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
                        .leftJoin(
                            sql`users as doctor_user`,
                            sql`doctor_user.id = ${doctors.userId}`
                        )
                        .where(eq(appointments.hospitalId, hospital.id))
                        .orderBy(desc(appointments.createdAt))
                        .limit(10),

                    // Recent doctors
                    ctx.db
                        .select({
                            id: doctors.id,
                            name: users.name,
                            specialization: doctors.specialization,
                            isActive: doctors.isActive,
                            createdAt: hospitalDoctors.createdAt,
                        })
                        .from(hospitalDoctors)
                        .leftJoin(doctors, eq(hospitalDoctors.doctorId, doctors.id))
                        .leftJoin(users, eq(doctors.userId, users.id))
                        .where(eq(hospitalDoctors.hospitalId, hospital.id))
                        .orderBy(desc(hospitalDoctors.createdAt))
                        .limit(5),
                ]);

                const appointmentStats = appointmentsByStatus.reduce(
                    (acc, curr) => {
                        acc[curr.status?.toLowerCase() || "unknown"] = curr.count;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                return {
                    hospitalId: hospital.id,
                    totalDoctors,
                    activeDoctors,
                    totalAppointments,
                    pendingAppointments: appointmentStats.pending || 0,
                    confirmedAppointments: appointmentStats.confirmed || 0,
                    completedAppointments: appointmentStats.completed || 0,
                    totalPatients,
                    recentAppointments,
                    recentDoctors,
                };
            }

            // DOCTOR Dashboard
            if (userRole === "DOCTOR") {
                // Find doctor for this user
                const doctor = await ctx.db
                    .select()
                    .from(doctors)
                    .where(eq(doctors.userId, userId))
                    .limit(1)
                    .then((r) => r[0]);

                if (!doctor) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Doctor not found",
                    });
                }

                const [
                    totalAppointments,
                    appointmentsByStatus,
                    totalConsultations,
                    totalPatients,
                    upcomingAppointments,
                    recentConsultations,
                    todayAppointments,
                ] = await Promise.all([
                    // Total appointments
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(eq(appointments.doctorId, doctor.id))
                        .then((r) => r[0]?.count || 0),

                    // Appointments by status
                    ctx.db
                        .select({
                            status: appointments.status,
                            count: sql<number>`count(*)`,
                        })
                        .from(appointments)
                        .where(eq(appointments.doctorId, doctor.id))
                        .groupBy(appointments.status),

                    // Total consultations
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(consultations)
                        .where(eq(consultations.doctorId, doctor.id))
                        .then((r) => r[0]?.count || 0),

                    // Total unique patients
                    ctx.db
                        .select({ count: sql<number>`count(DISTINCT ${appointments.patientId})` })
                        .from(appointments)
                        .where(eq(appointments.doctorId, doctor.id))
                        .then((r) => r[0]?.count || 0),

                    // Upcoming appointments
                    ctx.db
                        .select({
                            id: appointments.id,
                            appointmentDate: appointments.appointmentDate,
                            status: appointments.status,
                            patientName: sql<string>`patient_user.name`,
                            patientEmail: sql<string>`patient_user.email`,
                            hospitalName: hospitals.name,
                        })
                        .from(appointments)
                        .leftJoin(patients, eq(appointments.patientId, patients.id))
                        .leftJoin(
                            sql`users as patient_user`,
                            sql`patient_user.id = ${patients.userId}`
                        )
                        .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
                        .where(
                            and(
                                eq(appointments.doctorId, doctor.id),
                                sql`${appointments.appointmentDate} >= NOW()`,
                                eq(appointments.status, "CONFIRMED")
                            )
                        )
                        .orderBy(asc(appointments.appointmentDate))
                        .limit(10),

                    // Recent consultations
                    ctx.db
                        .select({
                            id: consultations.id,
                            patientName: sql<string>`patient_user.name`,
                            remarks: consultations.remarks,
                            createdAt: consultations.createdAt,
                            nextVisitDate: consultations.nextVisitDate,
                        })
                        .from(consultations)
                        .leftJoin(patients, eq(consultations.patientId, patients.id))
                        .leftJoin(
                            sql`users as patient_user`,
                            sql`patient_user.id = ${patients.userId}`
                        )
                        .where(eq(consultations.doctorId, doctor.id))
                        .orderBy(desc(consultations.createdAt))
                        .limit(5),

                    // Today's appointments
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(
                            and(
                                eq(appointments.doctorId, doctor.id),
                                sql`DATE(${appointments.appointmentDate}) = CURRENT_DATE`
                            )
                        )
                        .then((r) => r[0]?.count || 0),
                ]);

                const appointmentStats = appointmentsByStatus.reduce(
                    (acc, curr) => {
                        acc[curr.status?.toLowerCase() || "unknown"] = curr.count;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                return {
                    doctor,
                    doctorId: doctor.id,
                    totalAppointments,
                    pendingAppointments: appointmentStats.pending || 0,
                    confirmedAppointments: appointmentStats.confirmed || 0,
                    completedAppointments: appointmentStats.completed || 0,
                    todayAppointments,
                    totalConsultations,
                    totalPatients,
                    upcomingAppointments,
                    recentConsultations,
                };
            }

            // PATIENT Dashboard
            // if (userRole === "PATIENT") {
            //     // Find patient for this user
            //     const patient = await ctx.db
            //         .select({ id: patients.id })
            //         .from(patients)
            //         .where(eq(patients.userId, userId))
            //         .limit(1)
            //         .then((r) => r[0]);

            //     if (!patient) {
            //         throw new TRPCError({
            //             code: "NOT_FOUND",
            //             message: "Patient not found",
            //         });
            //     }

            //     const [
            //         totalAppointments,
            //         upcomingAppointments,
            //         pastAppointments,
            //         totalConsultations,
            //         recentConsultations,
            //         recentHealthMetrics,
            //         upcomingAppointmentsList,
            //     ] = await Promise.all([
            //         // Total appointments
            //         ctx.db
            //             .select({ count: sql<number>`count(*)` })
            //             .from(appointments)
            //             .where(eq(appointments.patientId, patient.id))
            //             .then((r) => r[0]?.count || 0),

            //         // Upcoming appointments count
            //         ctx.db
            //             .select({ count: sql<number>`count(*)` })
            //             .from(appointments)
            //             .where(
            //                 and(
            //                     eq(appointments.patientId, patient.id),
            //                     sql`${appointments.appointmentDate} >= NOW()`
            //                 )
            //             )
            //             .then((r) => r[0]?.count || 0),

            //         // Past appointments count
            //         ctx.db
            //             .select({ count: sql<number>`count(*)` })
            //             .from(appointments)
            //             .where(
            //                 and(
            //                     eq(appointments.patientId, patient.id),
            //                     sql`${appointments.appointmentDate} < NOW()`
            //                 )
            //             )
            //             .then((r) => r[0]?.count || 0),

            //         // Total consultations
            //         ctx.db
            //             .select({ count: sql<number>`count(*)` })
            //             .from(consultations)
            //             .where(eq(consultations.patientId, patient.id))
            //             .then((r) => r[0]?.count || 0),

            //         // Recent consultations
            //         ctx.db
            //             .select({
            //                 id: consultations.id,
            //                 doctorName: sql<string>`doctor_user.name`,
            //                 hospitalName: hospitals.name,
            //                 remarks: consultations.remarks,
            //                 nextVisitDate: consultations.nextVisitDate,
            //                 createdAt: consultations.createdAt,
            //             })
            //             .from(consultations)
            //             .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
            //             .leftJoin(
            //                 sql`users as doctor_user`,
            //                 sql`doctor_user.id = ${doctors.userId}`
            //             )
            //             .leftJoin(appointments, eq(consultations.appointmentId, appointments.id))
            //             .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
            //             .where(eq(consultations.patientId, patient.id))
            //             .orderBy(desc(consultations.createdAt))
            //             .limit(5),

            //         // Recent health metrics
            //         ctx.db
            //             .select({
            //                 id: healthMetrics.id,
            //                 sugarLevel: healthMetrics.sugarLevel,
            //                 cholesterol: healthMetrics.cholesterol,
            //                 bloodPressure: healthMetrics.bloodPressure,
            //                 reportType: healthMetrics.reportType,
            //                 recordedAt: healthMetrics.recordedAt,
            //             })
            //             .from(healthMetrics)
            //             .where(eq(healthMetrics.patientId, patient.id))
            //             .orderBy(desc(healthMetrics.recordedAt))
            //             .limit(5),

            //         // Upcoming appointments list
            //         ctx.db
            //             .select({
            //                 id: appointments.id,
            //                 appointmentDate: appointments.appointmentDate,
            //                 status: appointments.status,
            //                 doctorName: sql<string>`doctor_user.name`,
            //                 specialization: doctors.specialization,
            //                 hospitalName: hospitals.name,
            //             })
            //             .from(appointments)
            //             .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
            //             .leftJoin(
            //                 sql`users as doctor_user`,
            //                 sql`doctor_user.id = ${doctors.userId}`
            //             )
            //             .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
            //             .where(
            //                 and(
            //                     eq(appointments.patientId, patient.id),
            //                     sql`${appointments.appointmentDate} >= NOW()`
            //                 )
            //             )
            //             .orderBy(asc(appointments.appointmentDate))
            //             .limit(5),
            //     ]);

            //     return {
            //         patientId: patient.id,
            //         totalAppointments,
            //         upcomingAppointments,
            //         pastAppointments,
            //         totalConsultations,
            //         recentConsultations,
            //         recentHealthMetrics,
            //         upcomingAppointmentsList,
            //     };
            // }

            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Invalid role",
            });
        }),

    // ============================================
    getAppointments: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                pageSize: z.number().min(1).max(100).default(10),
                status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
                searchQuery: z.string().optional(),
                dateFrom: z.date().optional(),
                dateTo: z.date().optional(),
                doctorId: z.number().optional(),
                patientId: z.number().optional(),
                hospitalId: z.number().optional(),
            }).refine((data) => !data.dateFrom || !data.dateTo || data.dateTo >= data.dateFrom, {
                message: "dateTo must be after or equal to dateFrom",
                path: ["dateTo"],
            })
        )
        .query(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;
            const offset = (input.page - 1) * input.pageSize;

            // Build filters based on role
            const filters = [];

            if (userRole === "DOCTOR") {
                const doctor = await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                });
                if (doctor) filters.push(eq(appointments.doctorId, doctor.id));
            }
            //   else if (userRole === "PATIENT") {
            //     const patient = await ctx.db.query.patients.findFirst({
            //       where: eq(patients.userId, userId),
            //     });
            //     if (patient) filters.push(eq(appointments.patientId, patient.id));
            //   }
            else if (userRole === "HOSPITAL") {
                const hospital = await ctx.db.query.hospitals.findFirst({
                    where: eq(hospitals.userId, userId),
                });
                if (hospital) filters.push(eq(appointments.hospitalId, hospital.id));
            }

            // Apply optional filters
            if (input.status) filters.push(eq(appointments.status, input.status));
            if (input.doctorId) filters.push(eq(appointments.doctorId, input.doctorId));
            if (input.patientId) filters.push(eq(appointments.patientId, input.patientId));
            if (input.hospitalId) filters.push(eq(appointments.hospitalId, input.hospitalId));
            if (input.dateFrom) filters.push(gte(appointments.appointmentDate, input.dateFrom));
            if (input.dateTo) filters.push(lte(appointments.appointmentDate, input.dateTo));

            const [appointmentsList, totalCount] = await Promise.all([
                ctx.db.query.appointments.findMany({
                    where: filters.length > 0 ? and(...filters) : undefined,
                    limit: input.pageSize,
                    offset: offset,
                    orderBy: [desc(appointments.appointmentDate)],
                    with: {
                        patient: {
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        phone: true,
                                        image: true,
                                        address: true,
                                    },
                                },
                            },
                        },
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
                        hospital: {
                            columns: {
                                id: true,
                                name: true,
                                address: true,
                                contactNumber: true,
                            },
                        },
                    },
                }),
                ctx.db
                    .select({ count: sql<number>`count(*)` })
                    .from(appointments)
                    .where(filters.length > 0 ? and(...filters) : undefined)
                    .then((res) => res[0]?.count ?? 0),
            ]);

            return {
                appointments: appointmentsList,
                pagination: {
                    total: Number(totalCount),
                    page: input.page,
                    pageSize: input.pageSize,
                    totalPages: Math.ceil(Number(totalCount) / input.pageSize),
                },
            };
        }),

    // ============================================
    // APPOINTMENTS - UPDATE STATUS
    // ============================================
    updateAppointmentStatus: protectedProcedure
        .input(
            z.object({
                appointmentId: z.number(),
                status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;

            // Verify the appointment belongs to this doctor
            const appointment = await ctx.db.query.appointments.findFirst({
                where: eq(appointments.id, input.appointmentId),
                with: {
                    doctor: true,
                },
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }

            // Check permissions
            if (userRole === "DOCTOR") {
                const doctor = await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                });
                if (!doctor || appointment.doctorId !== doctor.id) {
                    throw new Error("Unauthorized to update this appointment");
                }
            }

            // Update the appointment
            await ctx.db
                .update(appointments)
                .set({
                    status: input.status,
                    updatedAt: sql`now()`,
                })
                .where(eq(appointments.id, input.appointmentId));

            return { success: true, message: `Appointment ${input.status.toLowerCase()}` };
        }),

    // ============================================
    // APPOINTMENTS - VERIFY OTP
    // ============================================
    verifyAppointmentOTP: protectedProcedure
        .input(
            z.object({
                appointmentId: z.number(),
                otp: z.string().length(6),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const appointment = await ctx.db.query.appointments.findFirst({
                where: eq(appointments.id, input.appointmentId),
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }

            if (appointment.otp !== input.otp) {
                throw new Error("Invalid OTP");
            }

            return { success: true, verified: true };
        }),

    // ============================================
    // CONSULTATIONS - CREATE
    // ============================================
    createConsultation: protectedProcedure
        .input(
            z.object({
                appointmentId: z.number(),
                remarks: z.string().optional(),
                prescriptionDetails: z.string().optional(),
                prescriptionImage: z.string().optional(),
                nextVisitDate: z.date().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;

            // Get doctor
            const doctor = await ctx.db.query.doctors.findFirst({
                where: eq(doctors.userId, userId),
            });

            if (!doctor || userRole !== "DOCTOR") {
                throw new Error("Only doctors can create consultations");
            }

            // Get appointment
            const appointment = await ctx.db.query.appointments.findFirst({
                where: eq(appointments.id, input.appointmentId),
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }

            if (appointment.doctorId !== doctor.id) {
                throw new Error("Unauthorized to create consultation for this appointment");
            }

            // Create consultation
            const [consultation] = await ctx.db
                .insert(consultations)
                .values({
                    appointmentId: input.appointmentId,
                    doctorId: doctor.id,
                    patientId: appointment.patientId,
                    remarks: input.remarks,
                    prescriptionDetails: input.prescriptionDetails,
                    prescriptionImage: input.prescriptionImage,
                    nextVisitDate: input.nextVisitDate,
                })
                .returning();

            // Update appointment status to COMPLETED
            await ctx.db
                .update(appointments)
                .set({
                    status: "COMPLETED",
                    updatedAt: sql`now()`,
                })
                .where(eq(appointments.id, input.appointmentId));

            return { success: true, consultationId: consultation.id };
        }),

    // ============================================
    // GET APPOINTMENT DETAILS
    // ============================================
    getAppointmentDetails: protectedProcedure
        .input(z.object({ appointmentId: z.number() }))
        .query(async ({ ctx, input }) => {
            const appointment = await ctx.db.query.appointments.findFirst({
                where: eq(appointments.id, input.appointmentId),
                with: {
                    patient: {
                        with: {
                            user: true,
                        },
                    },
                    doctor: {
                        with: {
                            user: true,
                        },
                    },
                    hospital: true,
                },
            });

            if (!appointment) {
                throw new Error("Appointment not found");
            }

            // Get patient's health metrics
            const healthMetricsData = await ctx.db.query.healthMetrics.findMany({
                where: eq(healthMetrics.patientId, appointment.patientId),
                orderBy: [desc(healthMetrics.recordedAt)],
                limit: 5,
            });

            // Get previous consultations
            const previousConsultations = await ctx.db.query.consultations.findMany({
                where: eq(consultations.patientId, appointment.patientId),
                orderBy: [desc(consultations.createdAt)],
                limit: 5,
                with: {
                    doctor: {
                        with: {
                            user: {
                                columns: { name: true },
                            },
                        },
                    },
                },
            });

            return {
                appointment,
                healthMetrics: healthMetricsData,
                previousConsultations,
            };
        }),

    // ============================================
    // PATIENTS LIST
    // ============================================
    getPatientsList: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                pageSize: z.number().min(1).max(100).default(10),
                searchQuery: z.string().optional(),
                gender: z.enum(["male", "female", "other"]).optional(),
                sortBy: z.enum(["createdAt", "lastVisit"]).default("createdAt"),
                sortOrder: z.enum(["asc", "desc"]).default("asc"),
            })
        )
        .query(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;
            const offset = (input.page - 1) * input.pageSize;

            const filters = [];

            // Role-based filtering
            if (userRole === "DOCTOR") {
                const doctor = await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                });
                if (doctor) {
                    // Get patients who have appointments with this doctor
                    const doctorPatients = await ctx.db
                        .selectDistinct({ patientId: appointments.patientId })
                        .from(appointments)
                        .where(eq(appointments.doctorId, doctor.id));

                    const patientIds = doctorPatients.map((p) => p.patientId);
                    if (patientIds.length > 0) {
                        filters.push(sql`${patients.id} IN ${patientIds}`);
                    }
                }
            } else if (userRole === "HOSPITAL") {
                const hospital = await ctx.db.query.hospitals.findFirst({
                    where: eq(hospitals.userId, userId),
                });
                if (hospital) {
                    const hospitalPatients = await ctx.db
                        .selectDistinct({ patientId: appointments.patientId })
                        .from(appointments)
                        .where(eq(appointments.hospitalId, hospital.id));

                    const patientIds = hospitalPatients.map((p) => p.patientId);
                    if (patientIds.length > 0) {
                        filters.push(sql`${patients.id} IN ${patientIds}`);
                    }
                }
            }

            // Search filter
            if (input.searchQuery) {
                filters.push(
                    or(
                        like(users.name, `%${input.searchQuery}%`),
                        like(users.email, `%${input.searchQuery}%`),
                        like(users.phone, `%${input.searchQuery}%`)
                    )
                );
            }

            // Gender filter
            if (input.gender) {
                filters.push(eq(patients.gender, input.gender));
            }

            // Determine sort order
            const sortOrder = input.sortOrder === "asc" ? asc : desc;
            let orderByClause;
            switch (input.sortBy) {
                case "createdAt":
                    orderByClause = sortOrder(users.createdAt);
                    break;
                default:
                    orderByClause = sortOrder(users.name);
            }

            const [patientsList, totalCount] = await Promise.all([
                ctx.db.query.patients.findMany({
                    where: filters.length > 0 ? and(...filters) : undefined,
                    limit: input.pageSize,
                    offset: offset,
                    orderBy: [orderByClause],
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                image: true,
                                address: true,
                                createdAt: true,
                            },
                        },
                    },
                }),
                ctx.db
                    .select({ count: sql<number>`count(*)` })
                    .from(patients)
                    .where(filters.length > 0 ? and(...filters) : undefined)
                    .then((res) => res[0]?.count ?? 0),
            ]);

            // Enrich with last appointment data
            const enrichedPatients = await Promise.all(
                patientsList.map(async (patient) => {
                    const lastAppointment = await ctx.db.query.appointments.findFirst({
                        where: eq(appointments.patientId, patient.id),
                        orderBy: [desc(appointments.appointmentDate)],
                        with: {
                            doctor: {
                                with: {
                                    user: {
                                        columns: { name: true },
                                    },
                                },
                            },
                        },
                    });

                    return {
                        ...patient,
                        lastAppointment: lastAppointment
                            ? {
                                date: lastAppointment.appointmentDate,
                                status: lastAppointment.status,
                                doctorName: lastAppointment.doctor.user.name,
                            }
                            : null,
                    };
                })
            );

            return {
                patients: enrichedPatients,
                pagination: {
                    total: Number(totalCount),
                    page: input.page,
                    pageSize: input.pageSize,
                    totalPages: Math.ceil(Number(totalCount) / input.pageSize),
                },
            };
        }),

    // ============================================
    // CALENDAR PAGE
    // ============================================
    getCalendarData: protectedProcedure
        .input(
            z.object({
                startDate: z.date(),
                endDate: z.date(),
                doctorId: z.number().optional(),
            }).refine((data) => data.endDate >= data.startDate, {
                message: "End date must be after or equal to start date",
                path: ["endDate"],
            })
        )
        .query(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;

            const filters = [
                gte(appointments.appointmentDate, input.startDate),
                lte(appointments.appointmentDate, input.endDate),
            ];

            // Role-based filtering
            if (userRole === "DOCTOR") {
                const doctor = await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                });
                if (doctor) filters.push(eq(appointments.doctorId, doctor.id));
            }
            //    else if (userRole === "PATIENT") {
            //     const patient = await ctx.db.query.patients.findFirst({
            //       where: eq(patients.userId, userId),
            //     });
            //     if (patient) filters.push(eq(appointments.patientId, patient.id));
            //   } 
            else if (userRole === "HOSPITAL") {
                const hospital = await ctx.db.query.hospitals.findFirst({
                    where: eq(hospitals.userId, userId),
                });
                if (hospital) filters.push(eq(appointments.hospitalId, hospital.id));
            }

            if (input.doctorId) {
                filters.push(eq(appointments.doctorId, input.doctorId));
            }

            const calendarAppointments = await ctx.db.query.appointments.findMany({
                where: and(...filters),
                orderBy: [asc(appointments.appointmentDate)],
                with: {
                    patient: {
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                    image: true,
                                },
                            },
                        },
                    },
                    doctor: {
                        with: {
                            user: {
                                columns: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });

            // Get doctor availability if viewing doctor's calendar
            let availability: any[] = [];
            if (userRole === "DOCTOR" || input.doctorId) {
                const doctorId = input.doctorId || (await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                }))?.id;

                if (doctorId) {
                    availability = await ctx.db.query.doctorAvailability.findMany({
                        where: eq(doctorAvailability.doctorId, doctorId),
                    });
                }
            }

            // Group appointments by date
            const appointmentsByDate = calendarAppointments.reduce((acc, apt) => {
                const dateKey = apt.appointmentDate.toISOString().split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(apt);
                return acc;
            }, {} as Record<string, typeof calendarAppointments>);

            return {
                appointments: calendarAppointments,
                appointmentsByDate,
                availability,
            };
        }),

    // ============================================
    // SCHEDULE PAGE
    // ============================================
    getScheduleData: protectedProcedure
        .input(
            z.object({
                date: z.date().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;
            const targetDate = input.date || new Date();

            // Set date range for the day
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            const filters = [
                gte(appointments.appointmentDate, startOfDay),
                lte(appointments.appointmentDate, endOfDay),
            ];

            if (userRole === "DOCTOR") {
                const doctor = await ctx.db.query.doctors.findFirst({
                    where: eq(doctors.userId, userId),
                    with: {
                        user: true,
                    },
                });
                if (doctor) {
                    filters.push(eq(appointments.doctorId, doctor.id));

                    // Get today's schedule
                    const todayAppointments = await ctx.db.query.appointments.findMany({
                        where: and(...filters),
                        orderBy: [asc(appointments.appointmentDate)],
                        with: {
                            patient: {
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
                    });

                    // Get availability for the day
                    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const availability = await ctx.db.query.doctorAvailability.findMany({
                        where: and(
                            eq(doctorAvailability.doctorId, doctor.id),
                            eq(doctorAvailability.dayOfWeek, dayName)
                        ),
                    });

                    // Get video consultation requests
                    const videoRequests = await ctx.db.query.videoBookRequests.findMany({
                        where: and(
                            eq(videoBookRequests.doctorId, doctor.id),
                            eq(videoBookRequests.requestStatus, "pending")
                        ),
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
                    });

                    return {
                        doctor: {
                            id: doctor.id,
                            name: doctor.user.name,
                            specialization: doctor.specialization,
                            image: doctor.user.image,
                        },
                        appointments: todayAppointments,
                        availability,
                        videoRequests,
                        stats: {
                            total: todayAppointments.length,
                            pending: todayAppointments.filter(a => a.status === "PENDING").length,
                            confirmed: todayAppointments.filter(a => a.status === "CONFIRMED").length,
                            completed: todayAppointments.filter(a => a.status === "COMPLETED").length,
                        },
                    };
                }
            }
            //   else if (userRole === "PATIENT") {
            //     const patient = await ctx.db.query.patients.findFirst({
            //       where: eq(patients.userId, userId),
            //       with: {
            //         user: true,
            //       },
            //     });

            //     if (patient) {
            //       filters.push(eq(appointments.patientId, patient.id));

            //       const todayAppointments = await ctx.db.query.appointments.findMany({
            //         where: and(...filters),
            //         orderBy: [asc(appointments.appointmentDate)],
            //         with: {
            //           doctor: {
            //             with: {
            //               user: {
            //                 columns: {
            //                   id: true,
            //                   name: true,
            //                   image: true,
            //                 },
            //               },
            //             },
            //           },
            //           hospital: {
            //             columns: {
            //               id: true,
            //               name: true,
            //               address: true,
            //               contactNumber: true,
            //             },
            //           },
            //         },
            //       });

            //       return {
            //         patient: {
            //           id: patient.id,
            //           name: patient.user.name,
            //           image: patient.user.image,
            //         },
            //         appointments: todayAppointments,
            //       };
            //     }
            //   }

            return {
                appointments: [],
                availability: [],
                videoRequests: [],
            };
        }),
    getIfIHaveHospital: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            const doctor = await ctx.db.query.doctors.findFirst({
                where: eq(doctors.userId, userId),
            });
            if (doctor?.hospitalId == null) {
                return { hasHospital: false };
            }
            return { hasHospital: true };
        })  
})