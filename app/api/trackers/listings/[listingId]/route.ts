import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};

export async function DELETE(request: NextRequest, context: RouteContext<'/api/trackers/listings/[listingId]'>) {
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

    // Check if the listing exists and belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        tracker: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const userId = parseInt(session.user.id, 10);

    if (listing.tracker.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the listing
    await prisma.listing.delete({
      where: { id: listingId }
    });

    return NextResponse.json({ message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}