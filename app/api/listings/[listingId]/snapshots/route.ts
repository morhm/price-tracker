import { NextRequest, NextResponse } from 'next/server';
import { getListingSnapshotsByListingId } from '@/queries/listingSnapshots';

export async function GET(_request: NextRequest, context: RouteContext<'/api/listings/[listingId]/snapshots'>) {
  try {
    const { listingId: paramListingId } = await context.params;
    const listingId = parseInt(paramListingId, 10);
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listingSnapshots = await getListingSnapshotsByListingId(listingId);

    return NextResponse.json({ listingSnapshots });
  } catch (error) {
    console.error('Error fetching listing snapshots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}