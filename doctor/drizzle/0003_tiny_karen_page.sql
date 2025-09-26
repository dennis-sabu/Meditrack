ALTER TABLE "patients" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "last_visit" timestamp;