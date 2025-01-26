ALTER TABLE "blacklisted_tokens" ALTER COLUMN "participant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "participants_trips" ALTER COLUMN "participant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "participants_trips" ALTER COLUMN "trip_id" SET NOT NULL;