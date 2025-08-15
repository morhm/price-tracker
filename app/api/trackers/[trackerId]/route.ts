import { NextRequest, NextResponse } from 'next/server';
import { getTrackerById } from '@/queries/trackers';

export async function GET(request: NextRequest, { params }: { params: { trackerId: string } }) {
  try {
    const { trackerId } = params;

    if (!trackerId) {
      return new NextResponse(JSON.stringify({ error: 'Tracker ID is required' }), { status: 400 });
    }

    // Example: Fetch tracker data (replace with your actual logic)
    const trackerData = await getTrackerById(parseInt(trackerId, 10))

    if (!trackerData) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    return NextResponse.json(trackerData, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching tracker data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}