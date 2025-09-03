import { NextRequest, NextResponse } from 'next/server';
import { getTrackerById, updateTrackerById } from '@/queries/trackers';

export async function GET(request: NextRequest, context: RouteContext<'/api/trackers/[trackerId]/listings'>) {
  try {
    const { trackerId: paramTrackerId } = await context.params;
    const trackerId = parseInt(paramTrackerId, 10);

    if (trackerId === null || trackerId === undefined) {
      return new NextResponse(JSON.stringify({ error: 'Tracker ID is required' }), { status: 400 });
    }

    // Example: Fetch tracker data (replace with your actual logic)
    const trackerData = await getTrackerById(trackerId)

    if (!trackerData) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    return NextResponse.json(trackerData, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error fetching tracker data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<'/api/trackers/[trackerId]/listings'>) {
  try {
    const { trackerId: paramTrackerId } = await context.params;
    const trackerId = parseInt(paramTrackerId, 10);

    if (!trackerId) {
      return new NextResponse(JSON.stringify({ error: 'Tracker ID is required' }), { status: 400 });
    }

    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Request body is required' }), { status: 400 });
    }

    const updatedTracker = await updateTrackerById(trackerId, body);

    if (!updatedTracker) {
      return NextResponse.json({ error: 'Tracker not found or update failed' }, { status: 404 });
    }

    return NextResponse.json(updatedTracker, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error updating tracker data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}