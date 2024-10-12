ALTER TABLE "participants" ALTER COLUMN "access_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "access_token" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "refresh_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "participants" ALTER COLUMN "refresh_token" DROP DEFAULT;