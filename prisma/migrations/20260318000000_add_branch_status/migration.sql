-- Add branch status column for tab-based filtering
-- Create enum if not exists
DO $$ BEGIN
    CREATE TYPE "BranchStatus" AS ENUM ('DRAFT', 'PENDING', 'LIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns if not exist
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "isLive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "status" "BranchStatus" NOT NULL DEFAULT 'PENDING';

-- Update status based on isLive (only where status is still PENDING/default)
UPDATE "branches" SET "status" = 'LIVE' WHERE "isLive" = true AND "status" = 'PENDING';
