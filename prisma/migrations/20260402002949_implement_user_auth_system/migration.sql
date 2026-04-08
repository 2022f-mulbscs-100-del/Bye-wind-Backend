-- Create UserRole enum for User authentication
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'OWNER', 'ADMIN');

-- Create User table for authentication
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receiveEmails" BOOLEAN NOT NULL DEFAULT true,
    "receiveSMS" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create UserPreference table
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietaryRestrictions" "DietaryRestriction"[] DEFAULT ARRAY[]::"DietaryRestriction"[],
    "favoriteCuisines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietaryRestrictionsText" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPartySize" INTEGER,
    "speakingPrefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- Create indexes for User table
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

-- Create unique index for UserPreference
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- Add ownerId to restaurants table
ALTER TABLE "restaurants" ADD COLUMN "ownerId" TEXT;

-- Add owner relationship constraint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create unique index for ownerId (one restaurant per owner initially)
CREATE UNIQUE INDEX "restaurants_ownerId_key" ON "restaurants"("ownerId");

-- Remove password-related columns from staff table
ALTER TABLE "staff" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "staff" DROP COLUMN IF EXISTS "staffUsername";
ALTER TABLE "staff" DROP COLUMN IF EXISTS "staffCredentialCreatedAt";

-- Make restaurantId optional in staff table (for flexibility)
ALTER TABLE "staff" ALTER COLUMN "restaurantId" DROP NOT NULL;

-- Add createdBy column to track who created staff member
ALTER TABLE "staff" ADD COLUMN "createdBy" TEXT;

-- Add foreign key for createdBy
ALTER TABLE "staff" ADD CONSTRAINT "staff_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update StaffRole enum: Add MANAGER if not exists
ALTER TYPE "StaffRole" ADD VALUE 'MANAGER' BEFORE 'SUPER_ADMIN';

-- Note: SUPER_ADMIN, OWNER, HOST values are kept for backward compatibility
-- but should not be used in new code. Use UserRole enum instead.
