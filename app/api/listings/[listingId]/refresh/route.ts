import { scrapeListingData } from '@/app/utils/web-scrape';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(requst: NextRequest, context: RouteContext<'/api/listings/[listingId]/refresh'>) {
  try {
    const { listingId: paramListingId } = await context.params;
    const listingId = parseInt(paramListingId, 10);

    if (!listingId) {
      return new NextResponse(JSON.stringify({ error: 'Listing ID is required' }), { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const scrapedData = await scrapeListingData(listing.url);

    let updatedListing = null;
    await prisma.$transaction(async (prismaClient) => {
      updatedListing = await prismaClient.listing.update({
        where: { id: listingId },
        data: {
          currentPrice: scrapedData.price || listing.currentPrice,
          isAvailable: scrapedData.isAvailable,
        }
      });

      if (scrapedData.price !== null && scrapedData.isAvailable) {
        // Update lowestAvailablePrice on tracker if applicable
        const tracker = await prismaClient.tracker.findUnique({ where: { id: listing.trackerId } });
        if (tracker) {
          const newLowestPrice = tracker.lowestAvailablePrice
            ? Math.min(tracker.lowestAvailablePrice.toNumber(), scrapedData.price)
            : scrapedData.price;

          await prismaClient.tracker.update({
            where: { id: tracker.id },
            data: {
              lowestAvailablePrice: newLowestPrice,
            }
          });
        }
      }

      // create a new history snapshot
      await prismaClient.listingSnapshot.create({
        data: {
          listingId: listing.id,
          price: scrapedData.price || listing.currentPrice,
          isAvailable: scrapedData.isAvailable,
          source: 'manual',
        }
      });
    })
    
    return NextResponse.json(updatedListing, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error refreshing listing data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}