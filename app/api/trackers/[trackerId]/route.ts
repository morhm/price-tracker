import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTrackerById, updateTrackerById } from '@/queries/trackers';
import { authOptions } from '@/lib/auth';
import { ensureTagsExist } from '@/queries/tags';

export async function GET(request: NextRequest, context: RouteContext<'/api/trackers/[trackerId]'>) {
  try {
    const { trackerId: paramTrackerId } = await context.params;
    const trackerId = parseInt(paramTrackerId, 10);

    if (trackerId !== 0 && !trackerId) {
      return new NextResponse(JSON.stringify({ error: 'Tracker ID is required' }), { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function PATCH(request: NextRequest, context: RouteContext<'/api/trackers/[trackerId]'>) {
  try {
    const { trackerId: paramTrackerId } = await context.params;
    const trackerId = parseInt(paramTrackerId, 10);

    if (trackerId !== 0 && !trackerId) {
      return new NextResponse(JSON.stringify({ error: 'Tracker ID is required' }), { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Request body is required' }), { status: 400 });
    }

    // If tags are being updated, ensure they exist
    if (body.tags) {
      const userId = parseInt(session.user.id, 10);
      await ensureTagsExist(userId, body.tags);
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