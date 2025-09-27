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

            if (userRole === "PATIENT") {
                // Find patient for this user
                const patient = await ctx.db
                    .select({ id: patients.id })
                    .from(patients)
                    .where(eq(patients.userId, userId))
                    .limit(1)
                    .then((r) => r[0]);

                if (!patient) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Patient not found",
                    });
                }

                const [
                    totalAppointments,
                    upcomingAppointments,
                    pastAppointments,
                    totalConsultations,
                    recentConsultations,
                    recentHealthMetrics,
                    upcomingAppointmentsList,
                ] = await Promise.all([
                    // Total appointments
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(eq(appointments.patientId, patient.id))
                        .then((r) => r[0]?.count || 0),

                    // Upcoming appointments count
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(
                            and(
                                eq(appointments.patientId, patient.id),
                                sql`${appointments.appointmentDate} >= NOW()`
                            )
                        )
                        .then((r) => r[0]?.count || 0),

                    // Past appointments count
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(appointments)
                        .where(
                            and(
                                eq(appointments.patientId, patient.id),
                                sql`${appointments.appointmentDate} < NOW()`
                            )
                        )
                        .then((r) => r[0]?.count || 0),

                    // Total consultations
                    ctx.db
                        .select({ count: sql<number>`count(*)` })
                        .from(consultations)
                        .where(eq(consultations.patientId, patient.id))
                        .then((r) => r[0]?.count || 0),

                    // Recent consultations
                    ctx.db
                        .select({
                            id: consultations.id,
                            doctorName: sql<string>`doctor_user.name`,
                            hospitalName: hospitals.name,
                            remarks: consultations.remarks,
                            nextVisitDate: consultations.nextVisitDate,
                            createdAt: consultations.createdAt,
                        })
                        .from(consultations)
                        .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
                        .leftJoin(
                            sql`users as doctor_user`,
                            sql`doctor_user.id = ${doctors.userId}`
                        )
                        .leftJoin(appointments, eq(consultations.appointmentId, appointments.id))
                        .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
                        .where(eq(consultations.patientId, patient.id))
                        .orderBy(desc(consultations.createdAt))
                        .limit(5),

                    // Recent health metrics
                    ctx.db
                        .select({
                            id: healthMetrics.id,
                            sugarLevel: healthMetrics.sugarLevel,
                            cholesterol: healthMetrics.cholesterol,
                            bloodPressure: healthMetrics.bloodPressure,
                            reportType: healthMetrics.reportType,
                            recordedAt: healthMetrics.recordedAt,
                        })
                        .from(healthMetrics)
                        .where(eq(healthMetrics.patientId, patient.id))
                        .orderBy(desc(healthMetrics.recordedAt))
                        .limit(5),

                    // Upcoming appointments list
                    ctx.db
                        .select({
                            id: appointments.id,
                            appointmentDate: appointments.appointmentDate,
                            status: appointments.status,
                            doctorName: sql<string>`doctor_user.name`,
                            specialization: doctors.specialization,
                            hospitalName: hospitals.name,
                        })
                        .from(appointments)
                        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
                        .leftJoin(
                            sql`users as doctor_user`,
                            sql`doctor_user.id = ${doctors.userId}`
                        )
                        .leftJoin(hospitals, eq(appointments.hospitalId, hospitals.id))
                        .where(
                            and(
                                eq(appointments.patientId, patient.id),
                                sql`${appointments.appointmentDate} >= NOW()`
                            )
                        )
                        .orderBy(asc(appointments.appointmentDate))
                        .limit(5),
                ]);

                return {
                    patientId: patient.id,
                    totalAppointments,
                    upcomingAppointments,
                    pastAppointments,
                    totalConsultations,
                    recentConsultations,
                    recentHealthMetrics,
                    upcomingAppointmentsList,
                };
            }

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
            })
        )
        .query(async ({ ctx, input }) => {
            const userRole = ctx.session.user.role;
            const userId = ctx.session.user.id;
            const offset = (input.page - 1) * input.pageSize;

            // Build filters based on role
            const filters = [];


            if (userRole === "PATIENT") {
                const patient = await ctx.db.query.patients.findFirst({
                    where: eq(patients.userId, userId),
                });
                if (patient) filters.push(eq(appointments.patientId, patient.id));
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
    generateOtp: protectedProcedure
        .input(z.object({ appointmentId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const appointment = await ctx.db.query.appointments.findFirst({
                where: eq(appointments.id, input.appointmentId),
            });
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Update appointment with OTP
            await ctx.db
                .update(appointments)
                .set({ otp: otp, updatedAt: new Date() })
                .where(eq(appointments.id, input.appointmentId));
            return { success: true, otp }; // In real app, don't return OTP directly
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


            if (userRole === "PATIENT") {
                const patient = await ctx.db.query.patients.findFirst({
                    where: eq(patients.userId, userId),
                    with: {
                        user: true,
                    },
                });

                if (patient) {
                    filters.push(eq(appointments.patientId, patient.id));

                    const todayAppointments = await ctx.db.query.appointments.findMany({
                        where: and(...filters),
                        orderBy: [asc(appointments.appointmentDate)],
                        with: {
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
                            hospital: {
                                columns: {
                                    id: true,
                                    name: true,
                                    address: true,
                                    contactNumber: true,
                                },
                            },
                        },
                    });

                    return {
                        patient: {
                            id: patient.id,
                            name: patient.user.name,
                            image: patient.user.image,
                        },
                        appointments: todayAppointments,
                    };
                }
            }

            return {
                appointments: [],
                availability: [],
                videoRequests: [],
            };
        }),

    getListOfHospitals: publicProcedure
        .query(async ({ ctx }) => {
            const hospitalsList = await ctx.db.query.hospitals.findMany({
                orderBy: [asc(hospitals.name)],
            });
            return hospitalsList;
        }),
    getHospitalById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const hospital = await ctx.db.query.hospitals.findFirst({
                where: eq(hospitals.id, input.id),
                with: {
                    user: true,
                    doctors: {
                        with: {
                            user: true,
                        }
                    },
                }
            })
            return hospital;
        }),
    sendAppointmentRequest: protectedProcedure
        .input(z.object({
            hospitalId: z.number(),
            doctorId: z.number(),
            appointmentDate: z.string(),
        })).mutation(async ({ ctx, input }) => {
            const { hospitalId, doctorId, appointmentDate } = input;
            // For simplicity, we assume the patient is already authenticated and we have their userId
            const userId = ctx.session?.user.id;

            if (!userId) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User must be logged in to book an appointment' });
            }
            // Find the patient record
            const patient = await ctx.db.query.patients.findFirst({
                where: eq(patients.userId, userId),
            });
            if (!patient) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Patient record not found' });
            }
            // Check if the doctor belongs to the specified hospital
            const hospitalDoctor = await ctx.db.query.hospitalDoctors.findFirst({
                where: and(
                    eq(hospitalDoctors.hospitalId, hospitalId),
                    eq(hospitalDoctors.doctorId, doctorId)
                ),
            });
            if (!hospitalDoctor) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Selected doctor does not belong to the specified hospital' });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Check if the doctor is available on the requested date
            const appointmentDateObj = new Date(appointmentDate);
            const dayOfWeek = appointmentDateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const availability = await ctx.db.query.doctorAvailability.findFirst({
                where: and(
                    eq(doctorAvailability.doctorId, doctorId),
                    eq(doctorAvailability.dayOfWeek, dayOfWeek)
                ),
            });
            // Create the appointment request
            const newAppointment = await ctx.db.insert(appointments).values({
                patientId: patient.id,
                doctorId: doctorId,
                hospitalId: hospitalId,
                appointmentDate: new Date(appointmentDate),
                status: 'PENDING',
                otp: otp,
            }).returning();
            return { success: true, appointment: newAppointment[0] };
        }),
    getMyAppointments: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            const userRole = ctx.session.user.role;

            if (userRole !== "PATIENT") {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Only patients can access their appointments'
                });
            }
            // Find the patient record
            const patient = await ctx.db.query.patients.findFirst({
                where: eq(patients.userId, userId),
            });

            if (!patient) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Patient record not found'
                });
            }

            // Get all appointments for this patient
            const patientAppointments = await ctx.db.query.appointments.findMany({
                where: eq(appointments.patientId, patient.id),
                orderBy: [desc(appointments.appointmentDate)],
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
                    hospital: {
                        columns: {
                            id: true,
                            name: true,
                            address: true,
                            contactNumber: true,
                            email: true,
                        },
                    },
                },
            });

            return patientAppointments;
        })
})