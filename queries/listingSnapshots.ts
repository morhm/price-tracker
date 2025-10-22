import { prisma } from '@/lib/db';
import type { ListingSnapshot } from '../app/generated/prisma';

export async function getListingSnapshotsByListingId(listingId: number): Promise<ListingSnapshot[]> {
  const listingSnapshots = await prisma.listingSnapshot.findMany({
    where: { listingId },
    orderBy: { createdAt: 'asc' }
  });
  return listingSnapshots;
}