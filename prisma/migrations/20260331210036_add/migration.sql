-- CreateEnum
CREATE TYPE "DietaryRestriction" AS ENUM ('VEGAN', 'VEGETARIAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_ALLERGY', 'SHELLFISH_ALLERGY', 'HALAL', 'KOSHER', 'LOW_SODIUM', 'KETO', 'PALEO');

-- CreateTable
CREATE TABLE "guest_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "profileImageUrl" TEXT,
    "bio" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastVisitDate" TIMESTAMP(3),
    "receiveEmails" BOOLEAN NOT NULL DEFAULT true,
    "receiveSMS" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_preferences" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "dietaryRestrictions" "DietaryRestriction"[] DEFAULT ARRAY[]::"DietaryRestriction"[],
    "favoriteCuisines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietaryRestrictionsText" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPartySize" INTEGER,
    "speakingPrefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_restaurants" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cuisine" TEXT,
    "rating" DOUBLE PRECISION,
    "priceRange" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisitDate" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "saved_restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_reviews" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "isVerifiedGuest" BOOLEAN NOT NULL DEFAULT true,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_visits" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "partySize" INTEGER NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_profiles_email_key" ON "guest_profiles"("email");

-- CreateIndex
CREATE INDEX "guest_profiles_email_idx" ON "guest_profiles"("email");

-- CreateIndex
CREATE INDEX "guest_profiles_memberSince_idx" ON "guest_profiles"("memberSince");

-- CreateIndex
CREATE UNIQUE INDEX "guest_preferences_guestId_key" ON "guest_preferences"("guestId");

-- CreateIndex
CREATE INDEX "saved_restaurants_guestId_idx" ON "saved_restaurants"("guestId");

-- CreateIndex
CREATE INDEX "saved_restaurants_restaurantId_idx" ON "saved_restaurants"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_restaurants_guestId_restaurantId_key" ON "saved_restaurants"("guestId", "restaurantId");

-- CreateIndex
CREATE INDEX "guest_reviews_guestId_idx" ON "guest_reviews"("guestId");

-- CreateIndex
CREATE INDEX "guest_reviews_restaurantId_idx" ON "guest_reviews"("restaurantId");

-- CreateIndex
CREATE INDEX "guest_reviews_rating_idx" ON "guest_reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "guest_reviews_guestId_restaurantId_visitDate_key" ON "guest_reviews"("guestId", "restaurantId", "visitDate");

-- CreateIndex
CREATE INDEX "guest_visits_guestId_idx" ON "guest_visits"("guestId");

-- CreateIndex
CREATE INDEX "guest_visits_restaurantId_idx" ON "guest_visits"("restaurantId");

-- CreateIndex
CREATE INDEX "guest_visits_visitDate_idx" ON "guest_visits"("visitDate");

-- AddForeignKey
ALTER TABLE "guest_preferences" ADD CONSTRAINT "guest_preferences_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_restaurants" ADD CONSTRAINT "saved_restaurants_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_restaurants" ADD CONSTRAINT "saved_restaurants_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_reviews" ADD CONSTRAINT "guest_reviews_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_reviews" ADD CONSTRAINT "guest_reviews_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_visits" ADD CONSTRAINT "guest_visits_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_visits" ADD CONSTRAINT "guest_visits_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
