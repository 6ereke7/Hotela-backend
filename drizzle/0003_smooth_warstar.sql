ALTER TABLE "rooms" RENAME COLUMN "price" TO "price_per_night";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "status" varchar(15) DEFAULT 'available' NOT NULL;