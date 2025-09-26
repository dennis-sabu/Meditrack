import { pgTable, serial, varchar, integer, boolean, timestamp, text, json, uuid, primaryKey, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

//
// USERS & AUTH
//
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 30 }).notNull(), // ADMIN, HOSPITAL_ADMIN, DOCTOR, PATIENT
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  phone: varchar("phone", { length: 20 }),
  emailVerificationToken: varchar("email_verification_token", { length: 100 }).default(''),
  loginType: varchar("login_type", { length: 20 }).notNull(), // Google, Credentials
  image: text("image"), // profile pic URL
  address: text("address"),
  country: varchar("country", { length: 50 }),
  emailVerified: boolean("email_verified").default(false),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
  governmentId: varchar("government_id", { length: 100 }), // Medical license, hospital reg, etc.
});

//
// HOSPITALS & DOCTORS
//
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  address: text("address"),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 150 }),
  registrationNumber: varchar("registration_number", { length: 100 }),
  adminId: integer("admin_id").references(() => users.id), // Hospital Admin user
  createdBy: integer("created_by").references(() => users.id), // System Admin who approved
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  hospitalId: integer("hospital_id").references(() => hospitals.id),
  medicalLicenseNumber: varchar("medical_license_number", { length: 100 }),
  specialization: varchar("specialization", { length: 100 }),
  experienceYears: integer("experience_years"),
  qualifications: text("qualifications"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  availableHours: json("available_hours"), // {"mon": ["09:00-17:00"], ...}
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//
// PATIENTS
//
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dob: timestamp("dob"),
  gender: varchar("gender", { length: 10 }),
  allergies: text("allergies"), // JSON/text for multiple
  medicalHistory: text("medical_history"),
});

//
// APPOINTMENTS & SCHEDULING
//
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  appointmentType: varchar("appointment_type", { length: 50 }).default("CONSULTATION"), // CONSULTATION, FOLLOW_UP, EMERGENCY
  status: varchar("status", { length: 30 }).default("PENDING"), // PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED
  scheduledAt: timestamp("scheduled_at").notNull(),
  endTime: timestamp("end_time"),
  symptoms: text("symptoms"),
  notes: text("notes"),
  cancelReason: text("cancel_reason"),
  rescheduledFrom: integer("rescheduled_from"),
  fee: decimal("fee", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 30 }).default("PENDING"), // PENDING, PAID, REFUNDED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Doctor Schedule Management
export const doctorSchedules = pgTable("doctor_schedules", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: varchar("start_time", { length: 10 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 10 }).notNull(), // "17:00"
  slotDuration: integer("slot_duration").default(30), // minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Time slots for appointments
export const appointmentSlots = pgTable("appointment_slots", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  isBooked: boolean("is_booked").default(false),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// PRESCRIPTIONS
//
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  notes: text("notes"), // doctor’s notes
  foodToAvoid: text("food_to_avoid"),
  prescriptionImage: text("prescription_image"), // optional upload URL
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  dosage: varchar("dosage", { length: 50 }), // e.g. "500mg"
  frequency: varchar("frequency", { length: 50 }), // e.g. "2 times/day"
  durationDays: integer("duration_days"),
  reminderTimes: json("reminder_times"), // ["08:00", "20:00"]
});

//
// MEDICINE INTAKE VERIFICATION
//
export const medicineIntake = pgTable("medicine_intake", {
  id: serial("id").primaryKey(),
  medicineId: integer("medicine_id").references(() => medicines.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  takenAt: timestamp("taken_at").defaultNow(),
  proofImage: text("proof_image"), // photo proof
  verifiedByDoctor: boolean("verified_by_doctor").default(false),
});

//
// EVENTS / NEXT CHECKUPS
//
export const patientEvents = pgTable("patient_events", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  type: varchar("type", { length: 100 }), // Regular Checkup, Blood Test, etc.
  scheduledFor: timestamp("scheduled_for").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// OTP AUTH (for secure record access)
//
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
});

//
// NOTIFICATIONS & MESSAGES
//
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // APPOINTMENT, PRESCRIPTION, SYSTEM, etc.
  isRead: boolean("is_read").default(false),
  data: json("data"), // Additional context data
  createdAt: timestamp("created_at").defaultNow(),
});

//
// HOSPITAL-DOCTOR RELATIONS
//
export const hospitalDoctors = pgTable("hospital_doctors", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  status: varchar("status", { length: 30 }).default("PENDING"), // PENDING, APPROVED, REJECTED, SUSPENDED
  joinedAt: timestamp("joined_at"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedBy: integer("approved_by").references(() => users.id),
});

//
// DRIZZLE RELATIONS
//
export const usersRelations = relations(users, ({ many, one }) => ({
  hospitals: many(hospitals, { relationName: "hospital_admin" }),
  createdHospitals: many(hospitals, { relationName: "created_by_admin" }),
  doctors: many(doctors),
  patients: many(patients),
  notifications: many(notifications),
}));

export const hospitalsRelations = relations(hospitals, ({ one, many }) => ({
  admin: one(users, {
    fields: [hospitals.adminId],
    references: [users.id],
    relationName: "hospital_admin"
  }),
  createdBy: one(users, {
    fields: [hospitals.createdBy],
    references: [users.id],
    relationName: "created_by_admin"
  }),
  doctors: many(doctors),
  appointments: many(appointments),
  hospitalDoctors: many(hospitalDoctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  hospital: one(hospitals, { fields: [doctors.hospitalId], references: [hospitals.id] }),
  appointments: many(appointments),
  schedules: many(doctorSchedules),
  slots: many(appointmentSlots),
  prescriptions: many(prescriptions),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  hospital: one(hospitals, { fields: [appointments.hospitalId], references: [hospitals.id] }),
  prescription: one(prescriptions),
  rescheduledFromAppointment: one(appointments, {
    fields: [appointments.rescheduledFrom],
    references: [appointments.id],
    relationName: "rescheduled_appointments"
  }),
}));

