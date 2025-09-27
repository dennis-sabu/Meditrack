import { pgTable, serial, varchar, integer, boolean, timestamp, text, json, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { create } from "domain";
//


// USERS (SuperAdmin, Hospital, Doctor, Patient)
//
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 30 }).notNull(), // ADMIN, HOSPITAL, DOCTOR, PATIENT
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  phone: varchar("phone", { length: 20 }),
  loginType: varchar("login_type", { length: 20 }).notNull(), // Google, Credentials
  image: text("image"),
  address: text("address"),
  country: varchar("country", { length: 50 }),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active"),
  isVerified: boolean("is_verified"),
  emailVerified: boolean("email_verified"),
});

//
// HOSPITALS
//
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // hospital login
  name: varchar("name", { length: 150 }).notNull(),
  address: text("address"),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 150 }),
  registrationNumber: varchar("registration_number", { length: 100 }),
  isVerified: boolean("is_verified").default(false), // ADMIN must set to true
  verifiedBy: integer("verified_by").references(() => users.id), // Super Admin who approved
  verifiedAt: timestamp("verified_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"), // active, inactive, rejected, pending
});

//
// DOCTORS
//
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // doctor login
  hospitalId: integer("hospital_id").references(() => hospitals.id),
  medicalLicenseNumber: varchar("medical_license_number", { length: 100 }),
  specialization: varchar("specialization", { length: 100 }),
  experienceYears: integer("experience_years"),
  qualifications: text("qualifications"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  availableHours: json("available_hours"), // {"mon": ["09:00-17:00"]}
  isVerified: boolean("is_verified"), // ADMIN must approve
  verifiedBy: integer("verified_by").references(() => users.id), // Super Admin who approved
  verifiedAt: timestamp("verified_at"),
  isActive: boolean("is_active").default(true),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // active, inactive, rejected, pending

});

//
// PATIENTS
//
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // patient login
  dob: timestamp("dob"),
  gender: varchar("gender", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastVisit: timestamp("last_visit"),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
});

//
// RELATIONS
//
export const usersRelations = relations(users, ({ many }) => ({
  hospitalAdmin: many(hospitals, { relationName: "hospitalAdmin" }),
  hospitalVerifications: many(hospitals, { relationName: "hospitalVerifier" }),
  doctorUser: many(doctors, { relationName: "doctorUser" }),
  doctorVerifications: many(doctors, { relationName: "doctorVerifier" }),
  patients: many(patients),
  subscriptions: many(subscriptions),
  razorpayOrders: many(razorpayOrdersTable),
  videoBookRequests: many(videoBookRequests),
}));

export const hospitalsRelations = relations(hospitals, ({ one, many }) => ({
  user: one(users, { fields: [hospitals.userId], references: [users.id], relationName: "hospitalAdmin" }),
  verifiedByUser: one(users, { fields: [hospitals.verifiedBy], references: [users.id], relationName: "hospitalVerifier" }),
  doctors: many(doctors),
  hospitalDoctors: many(hospitalDoctors),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id], relationName: "doctorUser" }),
  hospital: one(hospitals, { fields: [doctors.hospitalId], references: [hospitals.id] }),
  verifiedByUser: one(users, { fields: [doctors.verifiedBy], references: [users.id], relationName: "doctorVerifier" }),
  hospitalDoctors: many(hospitalDoctors),
  videoBookRequests: many(videoBookRequests),
}));

export const patientsRelations = relations(patients, ({ one }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
}));

// DOCTOR AVAILABILITY (Normalized instead of JSON)
//
export const doctorAvailability = pgTable("doctor_availability", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  dayOfWeek: varchar("day_of_week", { length: 10 }).notNull(), // Mon, Tue, Wed
  startTime: varchar("start_time", { length: 10 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 10 }).notNull(), // "17:00"
});

//
// APPOINTMENTS
//
// Create a new table for hospital join requests
export const hospitalJoinRequests = pgTable("hospital_join_requests", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  respondedBy: integer("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING"), // PENDING, CONFIRMED, COMPLETED, CANCELLED
  otp: varchar("otp", { length: 6 }).notNull(), // Security OTP for patient verification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//
// CONSULTATIONS (Doctor ↔ Patient session records)
//
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  remarks: text("remarks"),
  prescriptionDetails: text("prescription_details"), // medicine instructions
  prescriptionImage: text("prescription_image"), // uploaded prescription scan
  nextVisitDate: timestamp("next_visit_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// PRESCRIPTIONS (Enhanced medicine list with detailed fields)
//
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").references(() => consultations.id).notNull(),
  medicineName: varchar("medicine_name", { length: 150 }).notNull(),
  dosage: varchar("dosage", { length: 50 }).notNull(), // e.g. 500mg
  frequency: varchar("frequency", { length: 50 }).notNull(), // e.g. Twice a day
  durationDays: integer("duration_days").notNull(), // how many days
  instructions: text("instructions"), // Special instructions for the medicine
  beforeFood: boolean("before_food").default(true), // Whether to take before or after food
  startDate: timestamp("start_date").defaultNow(), // When to start taking the medicine
  endDate: timestamp("end_date"), // Calculated end date based on duration
  isActive: boolean("is_active").default(true), // Whether the prescription is still active
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//
// MEDICINE REMINDERS (For patient reminder functionality)
//
export const medicineReminders = pgTable("medicine_reminders", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  reminderTime: varchar("reminder_time", { length: 10 }).notNull(), // e.g. "09:00", "14:00", "21:00"
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//
// MEDICINE INTAKE LOG (Track when patient takes medicine)
//
export const medicineIntakeLog = pgTable("medicine_intake_log", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  takenAt: timestamp("taken_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("taken"), // taken, missed, skipped
  notes: text("notes"), // Optional notes from patient
  createdAt: timestamp("created_at").defaultNow(),
});

//
// HEALTH METRICS
//
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
  sugarLevel: decimal("sugar_level", { precision: 5, scale: 2 }),
  cholesterol: decimal("cholesterol", { precision: 5, scale: 2 }),
  bloodPressure: varchar("blood_pressure", { length: 20 }),
  reportFile: text("report_file"), // uploaded scan/report
  reportType: varchar("report_type", { length: 100 }), // e.g. "Blood Test", "MRI"
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

//
// RELATIONS
//
export const doctorAvailabilityRelations = relations(doctorAvailability, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorAvailability.doctorId], references: [doctors.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  hospital: one(hospitals, { fields: [appointments.hospitalId], references: [hospitals.id] }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  appointment: one(appointments, { fields: [consultations.appointmentId], references: [appointments.id] }),
  doctor: one(doctors, { fields: [consultations.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [consultations.patientId], references: [patients.id] }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  consultation: one(consultations, { fields: [prescriptions.consultationId], references: [consultations.id] }),
  reminders: many(medicineReminders),
  intakeLog: many(medicineIntakeLog),
}));

export const medicineRemindersRelations = relations(medicineReminders, ({ one }) => ({
  prescription: one(prescriptions, { fields: [medicineReminders.prescriptionId], references: [prescriptions.id] }),
  patient: one(patients, { fields: [medicineReminders.patientId], references: [patients.id] }),
}));

export const medicineIntakeLogRelations = relations(medicineIntakeLog, ({ one }) => ({
  prescription: one(prescriptions, { fields: [medicineIntakeLog.prescriptionId], references: [prescriptions.id] }),
  patient: one(patients, { fields: [medicineIntakeLog.patientId], references: [patients.id] }),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  patient: one(patients, { fields: [healthMetrics.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [healthMetrics.doctorId], references: [doctors.id] }),
}));

//
// HOSPITAL DOCTORS (Many-to-many relationship)
//
export const hospitalDoctors = pgTable("hospital_doctors", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// SUBSCRIPTIONS
//
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(), // Basic, Pro, Enterprise
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// PAYMENTS
//
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 100 }),
  method: varchar("method", { length: 50 }).notNull(), // RAZORPAY, etc
  transactionId: varchar("transaction_id", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(), // VIDEOBOOK, SUBSCRIPTION, etc
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

//
// RAZORPAY ORDERS
//
export const razorpayOrdersTable = pgTable("razorpay_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  orderId: varchar("order_id", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("INR"),
  status: varchar("status", { length: 20 }).default("created"),
  paymentId: varchar("payment_id", { length: 100 }),
  signature: varchar("signature", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//
// VIDEO BOOK REQUESTS
//
export const videoBookRequests = pgTable("video_book_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
  paymentId: varchar("payment_id", { length: 100 }),
  requestStatus: varchar("request_status", { length: 20 }).default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alias for backward compatibility
export const user = users;

//
// ADDITIONAL RELATIONS
//
export const hospitalDoctorsRelations = relations(hospitalDoctors, ({ one }) => ({
  hospital: one(hospitals, { fields: [hospitalDoctors.hospitalId], references: [hospitals.id] }),
  doctor: one(doctors, { fields: [hospitalDoctors.doctorId], references: [doctors.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  // Add relations as needed when more fields are defined
}));

export const razorpayOrdersRelations = relations(razorpayOrdersTable, ({ one }) => ({
  user: one(users, { fields: [razorpayOrdersTable.userId], references: [users.id] }),
}));

export const videoBookRequestsRelations = relations(videoBookRequests, ({ one }) => ({
  user: one(users, { fields: [videoBookRequests.userId], references: [users.id] }),
  doctor: one(doctors, { fields: [videoBookRequests.doctorId], references: [doctors.id] }),
}));

export const hospitalJoinRequestsRelations = relations(hospitalJoinRequests, ({ one }) => ({
  doctor: one(doctors, { fields: [hospitalJoinRequests.doctorId], references: [doctors.id] }),
  hospital: one(hospitals, { fields: [hospitalJoinRequests.hospitalId], references: [hospitals.id] }),
  respondedByUser: one(users, { fields: [hospitalJoinRequests.respondedBy], references: [users.id] }),
}));