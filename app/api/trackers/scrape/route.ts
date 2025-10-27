import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeListingData } from '@/app/utils/web-scrape';
import { getAllTrackersForScrape } from '@/queries/trackers';

export async function GET(request: Request) {
  try {
    // Verify the cron secret for security (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // fetch all trackers with their listings
    const trackers = await getAllTrackersForScrape()

    let scrapedListingsCount = 0;
    const errors: string[] = [];

    // Use for...of instead of forEach to properly await async operations
    for (const tracker of trackers) {
      const listings = tracker.listings;

      // iterate over each listing and scrape its current price
      for (const listing of listings) {
        try {
          const scrapedData = await scrapeListingData(listing.url);

          await prisma.$transaction(async (prisma) => {
            await prisma.listing.update({
              where: { id: listing.id },
              data: {
                currentPrice: scrapedData.price || listing.currentPrice,
                isAvailable: scrapedData.isAvailable,
                lastCheckedAt: new Date(),
              }
            });

            // update lowestAvailablePrice on tracker if applicable
            if (scrapedData.isAvailable) {
              const newLowestPrice = tracker.lowestAvailablePrice
                ? Math.min(tracker.lowestAvailablePrice.toNumber(), scrapedData.price || Infinity)
                : scrapedData.price || null;

              await prisma.tracker.update({
                where: { id: tracker.id },
                data: {
                  lowestAvailablePrice: newLowestPrice,
                }
              });
            }

            // create a new history snapshot
            await prisma.listingSnapshot.create({
              data: {
                listingId: listing.id,
                price: scrapedData.price || listing.currentPrice,
                isAvailable: scrapedData.isAvailable,
                source: 'cron',
              }
            });
          })

          scrapedListingsCount++;
        } catch (err) {
          const errorMsg = `Failed to scrape listing ${listing.id}: ${(err as Error).message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      console.log(`Finished scraping ${tracker._count} listings for tracker with ID ${tracker.id}`);
    }

    console.log(`Scraping complete. Total listings scraped: ${scrapedListingsCount}`);
    return NextResponse.json({
      ok: true,
      processed: scrapedListingsCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error in scrape route:', err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}