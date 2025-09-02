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
    data: {
      ...listingData,
      currentPrice: listingData.currentPrice ?? "",
      title: listingData.title || 'Untitled Listing'
    }
  });
  return newListing;
}

export async function getListingsByTrackerId(trackerId: number) {
  const listings = await prisma.listing.findMany({
    where: { trackerId },
    orderBy: { lastCheckedAt: 'desc' }
  });
  return listings;
}
