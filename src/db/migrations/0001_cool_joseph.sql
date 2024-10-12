ALTER TABLE "participants" ALTER COLUMN "access_token" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "access_token" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "refresh_token" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "refresh_token" SET DEFAULT gen_random_uuid();