import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the getTrackers function
vi.mock('@/queries/trackers', () => ({
  getTrackers: vi.fn(),
}));

// Import after mock is set up
const { GET } = await import('./route');
const { getTrackers } = await import('@/queries/trackers');

describe('/api/trackers GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return trackers with default pagination', async () => {
    const mockTrackers = [
      {
        id: 1,
        title: 'Test Tracker',
        description: 'Test Description',
        targetPrice: 99.99,
        createdAt: '2025-08-11T08:03:31.765Z',
        updatedAt: '2025-08-11T08:03:31.765Z',
        user: { id: 1, email: 'test@example.com' },
        tags: [],
        listings: [],
        _count: { listings: 0 }
      }
    ];
    const mockTotal = 1;

    vi.mocked(getTrackers).mockResolvedValue({ trackers: mockTrackers, total: mockTotal });

    const request = new NextRequest('http://localhost:3000/api/trackers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.trackers).toEqual(mockTrackers);
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.offset).toBe(0);
    expect(data.pagination.hasMore).toBe(false);
    expect(getTrackers).toHaveBeenCalledWith({ tagNames: [], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });
  });

  it('should handle query parameters correctly', async () => {
    const mockTrackers: any[] = [];
    const mockTotal = 25;
    vi.mocked(getTrackers).mockResolvedValue({ trackers: mockTrackers, total: mockTotal });

    const request = new NextRequest('http://localhost:3000/api/trackers?sort=title&order=asc&limit=5&offset=10&tags=Electronics,Books');
    const response = await GET(request);
    const data = await response.json();

    expect(getTrackers).toHaveBeenCalledWith({ tagNames: ['Electronics', 'Books'], sort: 'title', order: 'asc', limit: 5, offset: 10 });
    expect(data.pagination.total).toBe(25);
    expect(data.pagination.hasMore).toBe(true); // 10 + 5 < 25
  });

  it('should handle tags filtering', async () => {
    const mockTrackers: any[] = [];
    const mockTotal = 0;
    vi.mocked(getTrackers).mockResolvedValue({ trackers: mockTrackers, total: mockTotal });

    const request = new NextRequest('http://localhost:3000/api/trackers?tags=Electronics');
    const response = await GET(request);
    const data = await response.json();

    expect(getTrackers).toHaveBeenCalledWith({ tagNames: ['Electronics'], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });
    expect(data.pagination.total).toBe(0);
    expect(data.pagination.hasMore).toBe(false);
  });

  it('should return error when database operation fails', async () => {
    vi.mocked(getTrackers).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/trackers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch trackers');
  });

  it('should calculate hasMore correctly', async () => {
    const mockTrackers = new Array(5).fill({
      id: 1,
      title: 'Test Tracker',
      user: { id: 1, email: 'test@example.com' },
      tags: [],
      listings: [],
      _count: { listings: 0 }
    });
    const mockTotal = 20; // Total items in database

    vi.mocked(getTrackers).mockResolvedValue({ trackers: mockTrackers, total: mockTotal });

    const request = new NextRequest('http://localhost:3000/api/trackers?limit=5&offset=10');
    const response = await GET(request);
    const data = await response.json();

    expect(data.pagination.hasMore).toBe(true); // 10 + 5 < 20 = true
    expect(data.pagination.total).toBe(20);
    expect(data.pagination.limit).toBe(5);
    expect(data.pagination.offset).toBe(10);
    expect(getTrackers).toHaveBeenCalledWith({ tagNames: [], sort: 'createdAt', order: 'desc', limit: 5, offset: 10 });
  });
});