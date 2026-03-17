-- Add planTier to restaurants for tenant plan metadata
ALTER TABLE "restaurants"
ADD COLUMN IF NOT EXISTS "planTier" TEXT NOT NULL DEFAULT 'Starter';
