import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTrackers, createNewTracker } from '@/queries/trackers';
import { authOptions } from '../auth/[...nextauth]/route';
import { ensureTagsExist } from '@/queries/tags';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isArchived = searchParams.get('archived') === 'true';
    const tagNames = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const { trackers, total } = await getTrackers({ tagNames, sort, order, limit, offset, isArchived });

    return NextResponse.json({
      trackers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching trackers:', error);
    return NextResponse.json({ error: 'Failed to fetch trackers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      targetPrice,
      tags
    } = await request.json();

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const userId = parseInt(session.user.id, 10);
    const requestedTags = tags || [];

    // Ensure all requested tags exist
    await ensureTagsExist(userId, requestedTags);

    const newTrackerData = {
      title: title || 'New Tracker',
      description: description || '',
      userId: userId,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: requestedTags,
      listings: [],
      _count: { listings: 0 }
    };

    const newTracker = await createNewTracker(newTrackerData);

    return NextResponse.json(newTracker, { status: 201 });
  } catch (error) {
    console.error('Error creating tracker:', error);
    return NextResponse.json({ error: 'Failed to create tracker' }, { status: 500 });
  }
}