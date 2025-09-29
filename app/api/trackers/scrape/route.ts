import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeListingData } from '@/app/utils/web-scrape';


export async function GET() {
  try {
    // fetch all trackers with their listings
    const [ trackers, totalListingsCount ] = await Promise.all([
      prisma.tracker.findMany({ include: { listings: true }}),
      prisma.listing.count()
    ])

    let scrapedListingsCount = 0;
    // now iterate over each tracker and scrape their listings
    trackers.forEach(async (tracker) => {
      const listings = tracker.listings;

      // iterate over each listing and scrape its current price
      listings.forEach(async (listing) => {
        try {
          const scrapedData = await scrapeListingData(listing.url);
          // update the listing with the scraped data
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              currentPrice: scrapedData.price || listing.currentPrice,
              isAvailable: scrapedData.isAvailable,
              // optionally, you can add a price history entry here
            }
          });
          scrapedListingsCount++;
        } catch (err) {
          console.error(`Failed to scrape listing ${listing.id}:`, err);
        }
      });
    })

    return NextResponse.json({ ok: true, processed: scrapedListingsCount, total: totalListingsCount });
  } catch (err) {
    console.error('Error in scrape route:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
};