import { prisma } from "@/lib/db";

interface NewListingData {
    isAvailable: boolean;
    domain: string;
    trackerId: number;
    url: string;
    currentPrice: number | null;
    title: string | null;
    lastCheckedAt: Date;
}

export async function createNewListing(listingData: NewListingData) {
  const newListing = await prisma.listing.create({
    data: listingData
  });
  return newListing;
}