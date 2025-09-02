import { NextRequest, NextResponse } from 'next/server';

import { getTrackers, createNewTracker } from '@/queries/trackers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tagNames = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const { trackers, total } = await getTrackers({ tagNames, sort, order, limit, offset });

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
    // Implement logic to create a new tracker using the request body

    const newTrackerData = {
      title: title || 'New Tracker',
      description: description || '',
      userId: 289, // Replace with actual user ID from auth context
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: tags || [],
      listings: [],
      _count: { listings: 0 }
    };

    const newTracker = await createNewTracker(newTrackerData); // Placeholder function

    return NextResponse.json(newTracker, { status: 201 });
  } catch (error) {
    console.error('Error creating tracker:', error);
    return NextResponse.json({ error: 'Failed to create tracker' }, { status: 500 });
  }
}