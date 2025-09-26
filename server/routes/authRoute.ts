import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { and, eq, not, sql } from "drizzle-orm";
import bcrypt, { compare } from "bcrypt";
import { db } from "../db";
import { isAdminEmail, userZod } from "@/lib/validator";
import { TRPCError } from "@trpc/server";
import { triedAsync, trys } from "@/lib/utils";
import { randomUUID } from "crypto";
import { api } from "@/utils/server";
import { send } from "process";
import { env } from "@/env";
import { Users } from "lucide-react";
import { users, hospitals, doctors } from "../db/schema";
import { setBoolCookie } from "@/components/cook/cookies";

export const authRouter = createTRPCRouter({
    // Register Hospital Admin
    registerHospitalAdmin: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, "Admin name is required"),
                email: z.string().email("Valid email is required"),
                password: z.string().min(6, "Password must be at least 6 characters"),
                contactNumber: z.string().min(10, "Contact number is required"),
                address: z.string().min(10, "Address is required"),
                registrationNumber: z.string().min(5, "Registration number is required"),
                hospitalName: z.string().min(2, "Hospital name is required"),
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
                        name: input.name,
                        email: input.email,
                        passwordHash: hashedPassword,
                        phone: input.contactNumber,
                        role: "HOSPITAL_ADMIN",
                        loginType: "Credentials",
                        emailVerified: true,
                        governmentId: input.registrationNumber,
                    })
                    .returning();

                // Create hospital record
                const [hospital] = await ctx.db
                    .insert(hospitals)
                    .values({
                        name: input.hospitalName,
                        email: input.email,
                        address: input.address,
                        contactNumber: input.contactNumber,
                        registrationNumber: input.registrationNumber,
                        adminId: hospitalAdmin.id,
                        isVerified: false, // Pending admin approval
                    })
                    .returning();

                return {
                    success: true,
                    message: "Hospital admin registration submitted for verification",
                    hospital: {
                        id: hospital.id,
                        name: hospital.name,
                        isVerified: hospital.isVerified,
                    },
                };
            } catch (error: unknown) {
                if (error instanceof TRPCError) {
                    throw error;
                }
                console.error("Hospital admin registration error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Registration failed",
                });
            }
        }),

    // Register Doctor
    registerDoctor: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, "Name is required"),
                email: z.string().email("Valid email is required"),
                password: z.string().min(6, "Password must be at least 6 characters"),
                medicalLicenseNumber: z.string().min(5, "Medical license number is required"),
                specialization: z.string().min(2, "Specialization is required"),
                experienceYears: z.number().min(0, "Experience years must be positive").optional(),
                qualifications: z.string().min(10, "Qualifications are required"),
                bio: z.string().optional(),
                consultationFee: z.number().min(0, "Consultation fee must be positive").optional(),
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
                        experienceYears: input.experienceYears || 0,
                        qualifications: input.qualifications,
                        bio: input.bio,
                        consultationFee: input.consultationFee?.toString() || "0",
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
            } catch (error: unknown) {
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

    registerPatient: publicProcedure
        .input(
            z.object({
                name: z.string().min(1, "Name is required"),
                email: z.string().email("Invalid email format"),
                phone: z.string().min(1, "Phone number is required"),
                dateOfBirth: z.string().optional(),
                governmentId: z.string().optional(),
                password: z.string().min(6, "Password must be at least 6 characters"),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const hashedPassword = await bcrypt.hash(input.password, 10);

            try {
                // Check if user already exists
                const existingUser = await ctx.db.select().from(users).where(eq(users.email, input.email)).limit(1);
                if (existingUser.length > 0) {
                    throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
                }

                // Create user
                await ctx.db.insert(users).values({
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                    passwordHash: hashedPassword,
                    role: "PATIENT",
                    loginType: "Credentials",
                    country: "IN",
                    emailVerified: true,
                });

                return { success: true, message: "Patient registered successfully" };
            } catch (error: unknown) {
                if (error instanceof TRPCError && error.code === "CONFLICT") {
                    throw error;
                }
                console.error("Registration Error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" });
            }
        }),
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(6),
                username: z.string().min(4),
                confirmPassword: z.string().min(6),
                firstName: z.string().min(1),
                lastName: z.string().min(1),
                phone: z.number(),
                user_cc: z.number(),
                // role: z.enum(ROLES as [string, ...string[]]),
            })
                .refine((data) => data.password === data.confirmPassword, {
                    message: "Passwords do not match",
                    path: ["confirmPassword"], // Assign error to confirmPassword field
                })
        ).mutation(async ({ ctx, input }) => {
            const hashedPassword = await bcrypt.hash(input.password, 10);
            try {
                const existingUser = await ctx.db.select().from(users).where(eq(users.email, input.email)).limit(1);
                if (existingUser.length > 0) {
                    throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
                }
            } catch (error) {
                console.error("DB GET Error:1", error);
            }
            const user_cc = parseInt(`${input.user_cc}`, 10);
            await ctx.db.insert(users).values({
                phone: input.phone.toString(),
                email: input.email,
                name: input.firstName,
                loginType: 'Credentials',
                role: "USER",
                country: "IN",
                emailVerified: true,
                passwordHash: hashedPassword,
            });
            // await api.mail.welcome({
            //     email: input.email,
            //     firstName: input.firstName + ' ' + input.lastName
            // });
            // setBoolCookie("iscompletedProfile", false);
            // setBoolCookie('isFirstVisit', true);
            return { success: true, message: "User registered successfully" };
        }),
    googleLoginRegister: publicProcedure.input(
        z.object({
            id: z.string(),
            email: z.string().email(),
            image: z.string().url(),
            role: z.enum(["PATIENT"]),
            name: z.string().min(1, 'name is required'),
            phone: z.string().optional(),
        })
    )
        .mutation(async ({ ctx, input }) => {
            // Check if user exists
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, input.email),
            });

            if (existingUser) {
                return { success: true, user: existingUser };
            } else {
                // Create new user
                const hashedPassword = await bcrypt.hash(input.email, 10); // Use Google ID as a placeholder password
                const newUser = await db.insert(users).values({
                    email: input.email,
                    image: input.image,
                    role: input.role ,
                    name: input.name,
                    loginType: 'Google',
                    phone: "" + (input.phone ?? ''),
                    country: "IN",
                    emailVerified: true,
                    passwordHash: hashedPassword,
                }).returning();
                // await api.mail.welcome({
                //     email: input.email,
                //     firstName: input.firstName + ' ' + input.lastName
                // });
                setBoolCookie("iscompletedProfile", false);
                setBoolCookie('isFirstVisit', true);

                return { success: true, message: "User created successfully", user: newUser[0] };
            }
        }),
    login: publicProcedure
        .input(z.object({
            email: z.string(),
            password: z.string().min(6),
        }))
        .mutation(async ({ input, ctx }) => {
            // Find user
            const u = await db.query.users.findFirst({
                where: (user) => eq(user.email, input.email),
            });

            if (!u) {
                throw new TRPCError({ code: 'NOT_FOUND', message: "User not found" });
            }

            // Check password
            const passwordMatch = await bcrypt.compare(input.password, u.passwordHash);
            if (!passwordMatch) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
            }
            const up = await ctx.db.update(users).set({
                lastLogin: new Date(),
            }).where(eq(users.id, u.id))
            // await ctx.db.update(user).set
            return { message: "Login successful", user: u };
        }),
    loginwithEmail: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(6),
        }))
        .mutation(async ({ input, ctx }) => {
            // Find user
            const u = await db.query.users.findFirst({
                where: (user) => eq(user.email, input.email),
            });

            if (!u) {
                throw new TRPCError({ code: 'NOT_FOUND', message: "User not found" });
            }

            // Check password
            const passwordMatch = await bcrypt.compare(input.password, u.passwordHash);
            if (!passwordMatch) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
            }
            // await ctx.db.update(user).set
            const up = await ctx.db.update(users).set({
                lastLogin: new Date()
            }).where(eq(users.id, u.id)).returning();
           
            return { message: "Login successful", user: u };
        }),
    sendVerificationEmail: protectedProcedure
        .input(z.void())
        .mutation(async ({ input, ctx }) => {
            if (ctx.user.emailVerified) {
                return {
                    message: "Verification Already Done",
                    success: false
                }
            }
            const token = randomUUID();
            if (ctx.user.emailVerificationToken == '') {
                const updatedUser = await db.update(users).set({
                    emailVerified: false,
                    emailVerificationToken: token
                }).where(eq(users.id, ctx.user.id)).returning();
            }
            // Send verification email
           
            return { message: "Verification email sent successfully", success: true };
        }),
    verifyEmail: publicProcedure
        .input(z.object({
            token: z.string(),
            email: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Check if user exists
            const cusers = await db.query.users.findFirst({
                where: (user) => and(eq(user.emailVerificationToken, input.token), eq(user.email, input.email)),
            });

            if (!cusers) {
                return {
                    success: false,
                    message: "Invalid Details",
                    url: `${env.NEXT_PUBLIC_WEBSITE_URL}/signin`
                }
            }

            // Update user's email verification status
            const updatedUser = await db.update(users).set({
                emailVerified: true,
                emailVerificationToken: randomUUID()
            }).where(eq(users.id, cusers.id)).returning();

            return { success: true, message: "Email verified successfully", url: `${env.NEXT_PUBLIC_WEBSITE_URL}/myworkspace` };
        }),
    checkEMailVerified: protectedProcedure.input(z.void()).query(({ ctx, input }) => {
        return ctx.user.emailVerified
    }),
    //gooogle new account completion
    gCompleteRegistration: protectedProcedure.input(z.object({
        name: z.string().min(1, 'name is required'),
        phone: z.string().min(1, "Phone number is required"),
        password: z.string().min(3, 'password is required'),
        confirmPassword: z.string().min(3, 'Confirm password is required'),
    })).mutation(async ({ ctx, input }) => {
        const userId = Number(ctx.session.user.id);
        if (input.password != input.confirmPassword) {
            throw new TRPCError({ message: "INVALID REQUEST", code: "BAD_REQUEST" });
        }
        const hashedNewPassword = await bcrypt.hash(input.password, 10);

        const updated = await db.update(users)
            .set({
                name: input.name,
                phone: input.phone,
                passwordHash: hashedNewPassword,
                lastLogin: new Date()
            })
            .where(eq(users.id, userId)).returning();
        return updated;
    }),
    setAsUser: protectedProcedure
        .input(z.void())
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Update profile
            const updated = await db.update(users)
                .set({
                    role: "USER",
                })
                .where(eq(users.id, Number(userId))).returning();
            return { success: true, message: "Profile updated successfully" };
        }),
    // setcompanyOwnership: protectedProcedure.input(z.object({
    //     companyId: z.string(),
    // })).mutation(async ({ ctx, input }) => {
    //     const userId = ctx.session.user.id;

    //     const userq = await db.query.user.findFirst({
    //         where: (user) => and(eq(user.id, userId)),
    //     });
    //     if (!userq) {
    //         throw new TRPCError({ code: "UNAUTHORIZED", message: "User Not Found" });
    //     }
    //     const updated = await db.update(user)
    //         .set({
    //             currentCompanyId:input.companyId,
    //             role:"COMPANY"
    //         })
    //         .where(eq(user.id, userId)).returning();

    //     if(updated){
    //         return {
    //             success:true
    //         }
    //     }
    //     return {
    //         success: false
    //     }
    // }),
    tokenValidation: protectedProcedure.input(z.object({
        token: z.string()
    })).mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;

        const userq = await db.query.users.findFirst({
            where: (user) => and(eq(users.id, Number(userId))),
        });
        if (!userq) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "User Not Found" });
        }
        if (userq.emailVerificationToken != input.token) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid Token" });
        }
        return {
            verified: true,
            currentPass: userq.passwordHash
        }
    }),
    // 🔐 Role-Based Access Control Middleware
    checkRole: protectedProcedure
        .input(z.object({ requiredRole: z.enum(["ADMIN","HOSPITAL_ADMIN", "DOCTOR", "PATIENT"]) }))
        .query(async ({ input, ctx }) => {
            const user = await db.query.users.findFirst({
                where: (user) => eq(users.id, Number(ctx.session.user.id)),
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            if (user.role !== input.requiredRole) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
            }

            return { message: "Access granted" };
        }),

    // 🛠 Master Admin Middleware
    isMasterAdmin: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await db.query.users.findFirst({
                where: (user) => eq(user.id, Number(ctx.session.user.id)),
            });

            if (!user || user.role !== "ADMIN") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
            }

            return { message: "Master Admin access granted" };
        }),
    changePassword: protectedProcedure
        .input(
            z.object({
                currentPassword: z.string().min(6),
                newPassword: z.string().min(6),
                confirmPassword: z.string().min(6),
            }).refine((data) => data.newPassword === data.confirmPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"], // Assign error to confirmNewPassword field
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is authenticated
            if (!ctx.session?.user?.id) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
            }

            // Fetch user data from DB
            const userData = await db.query.users.findFirst({
                where: eq(users.id, Number(ctx.session.user.id)),
            });

            if (!userData) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            // Validate current password
            const passwordMatch = await bcrypt.compare(input.currentPassword, userData.passwordHash);
            if (!passwordMatch) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid current password" });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(input.newPassword, 10);

            // Update user's password in the database
            await db.update(users)
                .set({
                    passwordHash: hashedNewPassword,
                })
                .where(eq(users.id, Number(ctx.session.user.id)));

            return { success: true, message: "Password changed successfully" };
        }),
    // Role-based routing
    getRole: protectedProcedure.query(async ({ ctx }) => {
        const userData = await db.query.users.findFirst({
            where: eq(users.id, Number(ctx.session.user.id)),
        });
        if (!userData) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return { role: userData.role };
    }),
    getUser: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
        const userData = await ctx.db.query.users.findFirst({
            where: (user) => eq(user.id, Number(ctx.session?.user.id)),
            columns: {
                id: true,
                address: true,
                email: true,
                name: true,
                phone: true,
                image: true,
                country: true,
                role: true,
                loginType: true,
            },
        });
        if (!userData || userData == undefined) {
            console.log("USER NOT FOUND")
            return Promise.reject(new TRPCError({ code: "UNAUTHORIZED", message: "User not found" }));
            // throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
        } else {
            return userData;
        }
    }),
    verifyAdminEmail: publicProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (!isAdminEmail(input.email)) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Invalid Email & Password" });
            }
            const admin = await db.query.users.findFirst({
                where: eq(users.email, input.email),
            });
            if (!await compare(input.password, admin?.passwordHash ?? '')) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid Credentials" });
            }
            if (!admin) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Invalid Email & Password" });
            }
            return {
                message: "Admin email verified", admin: {
                    id: admin?.id ?? '',
                    email: admin?.email ?? '',
                    username: admin?.name ?? '',
                    role: "ADMIN",
                }
            };
        }),
});
