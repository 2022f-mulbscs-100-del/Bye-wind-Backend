-- Add staff login credentials fields
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "staffUsername" TEXT;
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "staffCredentialCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Generate unique staffUsername from email for existing records (PostgreSQL syntax)
UPDATE "staff" 
SET "staffUsername" = LOWER(
  CASE 
    WHEN email LIKE '%@%' THEN CONCAT(SPLIT_PART(email, '@', 1), '_', SUBSTR(id, 1, 8))
    ELSE CONCAT(email, '_', SUBSTR(id, 1, 8))
  END
)
WHERE "staffUsername" IS NULL;

-- Make staffUsername NOT NULL and UNIQUE
ALTER TABLE "staff" ALTER COLUMN "staffUsername" SET NOT NULL;
ALTER TABLE "staff" ADD CONSTRAINT "staff_staffUsername_key" UNIQUE ("staffUsername");

