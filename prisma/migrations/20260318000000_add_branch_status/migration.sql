-- Add branch status column for tab-based filtering
CREATE TYPE "BranchStatus" AS ENUM ('DRAFT', 'PENDING', 'LIVE');
ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "status" "BranchStatus" NOT NULL DEFAULT 'PENDING';
UPDATE "branches" SET "status" = 'LIVE' WHERE "isLive" = true;
