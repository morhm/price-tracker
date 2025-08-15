import { NextRequest, NextResponse } from 'next/server';

import { getTrackers } from '@/queries/trackers';

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