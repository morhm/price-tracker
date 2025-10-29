-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRICE_DROP', 'PRICE_INCREASE', 'OUT_OF_STOCK', 'BACK_IN_STOCK', 'LINK_BROKEN', 'LINK_RESTORED');

-- CreateTable
CREATE TABLE "ListingEvent" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "trackerId" INTEGER NOT NULL,
    "eventType" "EventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingEvent_listingId_createdAt_idx" ON "ListingEvent"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "ListingEvent_trackerId_createdAt_idx" ON "ListingEvent"("trackerId", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingEvent" ADD CONSTRAINT "ListingEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingEvent" ADD CONSTRAINT "ListingEvent_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "Tracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;