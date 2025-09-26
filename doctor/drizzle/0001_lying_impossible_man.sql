ALTER TABLE "doctors" ALTER COLUMN "is_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_active" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "hospitals" ADD COLUMN "status" varchar(20) DEFAULT 'pending';