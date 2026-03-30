-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ZoneType" ADD VALUE 'RESTAURANT_AREA';
ALTER TYPE "ZoneType" ADD VALUE 'HOTEL_AREA';
ALTER TYPE "ZoneType" ADD VALUE 'LOUNGE_AREA';
ALTER TYPE "ZoneType" ADD VALUE 'SERVICE_AREA';
ALTER TYPE "ZoneType" ADD VALUE 'ENTRANCE_ZONE';

-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "spacing" DOUBLE PRECISION NOT NULL DEFAULT 12;

-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "cornerRadius" DOUBLE PRECISION NOT NULL DEFAULT 24,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL DEFAULT 180,
ADD COLUMN     "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL DEFAULT 320,
ADD COLUMN     "zIndex" INTEGER NOT NULL DEFAULT 1;
