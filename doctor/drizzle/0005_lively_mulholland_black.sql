CREATE TABLE "medicine_intake_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"taken_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'taken',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medicine_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"reminder_time" varchar(10) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_triggered" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "dosage" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "frequency" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "duration_days" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "before_food" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "start_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "medicine_intake_log" ADD CONSTRAINT "medicine_intake_log_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_intake_log" ADD CONSTRAINT "medicine_intake_log_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_reminders" ADD CONSTRAINT "medicine_reminders_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_reminders" ADD CONSTRAINT "medicine_reminders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;