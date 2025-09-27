import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../api/trpc";
import { eq, and } from "drizzle-orm";
import bcrypt, { compare } from "bcrypt";
import { db } from "../db";
import { users, hospitals, doctors, consultations, prescriptions, medicineReminders, appointments, patients } from "../db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { env } from "@/env";

/* ------------------ DOCTOR ROUTER ------------------ */
export const doctorRouter = createTRPCRouter({

    // Create consultation with medicines
    createConsultation: protectedProcedure
        .input(z.object({
            appointmentId: z.number(),
            remarks: z.string(),
            prescriptionDetails: z.string().optional(),
            nextVisitDate: z.string().optional(),
            medicines: z.array(z.object({
                name: z.string(),
                dosage: z.string(),
                frequency: z.string(),
                duration: z.number(),
                instructions: z.string(),
                beforeFood: z.boolean(),
            }))
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                // Get appointment details to find patient
                const appointment = await db.query.appointments.findFirst({
                    where: eq(appointments.id, input.appointmentId),
                    with: {
                        patient: true
                    }
                });
                const doctor = await db.query.doctors.findFirst({
                    where: eq(doctors.id, ctx.session.user.id),
                });
                if (!doctor) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Doctor not found"
                    });
                }
                if (!appointment) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Appointment not found"
                    });
                }

                // Create consultation
                const [consultation] = await db.insert(consultations).values({
                    appointmentId: input.appointmentId,
                    doctorId: doctor.id,
                    patientId: appointment.patientId,
                    remarks: input.remarks,
                    prescriptionDetails: input.prescriptionDetails,
                    nextVisitDate: input.nextVisitDate ? new Date(input.nextVisitDate) : null,
                }).returning();

                // Create prescriptions for each medicine
                for (const medicine of input.medicines) {
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + medicine.duration);

                    const [prescription] = await db.insert(prescriptions).values({
                        consultationId: consultation.id,
                        medicineName: medicine.name,
                        dosage: medicine.dosage,
                        frequency: medicine.frequency,
                        durationDays: medicine.duration,
                        instructions: medicine.instructions,
                        beforeFood: medicine.beforeFood,
                        endDate: endDate,
                    }).returning();

                    // Create medicine reminders based on frequency
                    const reminderTimes = getReminderTimes(medicine.frequency);
                    for (const time of reminderTimes) {
                        await db.insert(medicineReminders).values({
                            prescriptionId: prescription.id,
                            patientId: appointment.patientId,
                            reminderTime: time,
                        });
                    }
                }

                // Update appointment status to completed
                await db.update(appointments)
                    .set({ status: 'COMPLETED' })
                    .where(eq(appointments.id, input.appointmentId));

                return { success: true, consultationId: consultation.id };
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create consultation ${error instanceof Error ? error.message : ''}`,
                });
            }
        }),

    // Get consultation details with medicines
    getConsultationDetails: protectedProcedure
        .input(z.object({
            consultationId: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const consultation = await db.query.consultations.findFirst({
                where: eq(consultations.id, input.consultationId),
                with: {
                    prescriptions: true,
                    patient: true,
                    doctor: true
                }
            });

            if (!consultation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Consultation not found"
                });
            }

            return consultation;
        }),
});

// Helper function to generate reminder times based on frequency
function getReminderTimes(frequency: string): string[] {
    const times: string[] = [];

    if (frequency.toLowerCase().includes('once')) {
        times.push('09:00');
    } else if (frequency.toLowerCase().includes('twice')) {
        times.push('09:00', '21:00');
    } else if (frequency.toLowerCase().includes('thrice') || frequency.toLowerCase().includes('three')) {
        times.push('09:00', '14:00', '21:00');
    } else if (frequency.toLowerCase().includes('four')) {
        times.push('08:00', '12:00', '16:00', '20:00');
    } else {
        // Default to twice a day
        times.push('09:00', '21:00');
    }

    return times;
}