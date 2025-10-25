import { prisma } from "@/lib/db";
import type { Listing } from '../app/generated/prisma';

interface NewListingData {
    isAvailable: boolean;
    domain: string;
    trackerId: number;
    url: string;
    currentPrice: number | null;
    title: string | null;
    lastCheckedAt: Date;
}

export async function createNewListing(listingData: NewListingData): Promise<Listing> {
  const newListing = await prisma.listing.create({
    data: {
      ...listingData,
      currentPrice: listingData.currentPrice ?? 0,
      title: listingData.title || 'Untitled Listing'
    }
  });
  return newListing;
}

export async function getListingsByTrackerId(trackerId: number): Promise<Listing[]> {
  const listings = await prisma.listing.findMany({
    where: { trackerId },
    orderBy: { lastCheckedAt: 'desc' }
  });
  return listings;
}
