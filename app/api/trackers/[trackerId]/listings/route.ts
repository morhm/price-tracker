import { NextRequest, NextResponse } from 'next/server';
import { createNewListing, getListingsByTrackerId } from '@/queries/listings';
import { scrapeListingData } from '@/app/utils/web-scrape';

export async function GET(request: NextRequest, { params }: { params: { trackerId: string } }) {
  try {
    const trackerId = parseInt(params.trackerId, 10);
    if (isNaN(trackerId)) {
      return NextResponse.json({ error: 'Invalid tracker ID' }, { status: 400 });
    }

    const listings = await getListingsByTrackerId(trackerId);

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { trackerId: string } }) {
  try {
    const trackerId = parseInt(params.trackerId, 10);
    if (isNaN(trackerId)) {
      return NextResponse.json({ error: 'Invalid tracker ID' }, { status: 400 });
    }

    const { url, price, title } = await request.json();
    const domain = new URL(url).hostname;

    if (!domain || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const { price: parsedPrice, isAvailable } = await scrapeListingData(url);

    const newListingData = {
      isAvailable: isAvailable,
      domain,
      trackerId,
      url,
      currentPrice: price ? parseFloat(price) : parsedPrice,
      title,
      lastCheckedAt: new Date()
    };

    const newListing = await createNewListing(newListingData); // Placeholder function

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}