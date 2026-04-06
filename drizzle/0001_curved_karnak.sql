CREATE TYPE "public"."user_type" AS ENUM('creator', 'fan');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "userType" "user_type";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboardingCompleted" boolean DEFAULT false NOT NULL;