import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the getTrackerById function
const mockGetTrackerById = vi.fn();

vi.mock('@/queries/trackers', () => ({
  getTrackerById: mockGetTrackerById,
}));

// Import after mock is set up
const { GET } = await import('./route');

describe('/api/trackers/[trackerId] GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return tracker data for valid ID', async () => {
    const mockTracker = {
      id: 1,
      title: 'iPhone Tracker',
      description: 'Track iPhone prices',
      targetPrice: '999',
      userId: 1,
      createdAt: '2025-08-11T08:03:31.765Z',
      updatedAt: '2025-08-11T08:03:31.765Z',
      user: {
        id: 1,
        email: 'user@example.com'
      },
      tags: [
        {
          id: 1,
          name: 'Electronics',
          userId: 1,
          createdAt: '2025-08-11T08:03:31.765Z'
        }
      ],
      listings: [
        {
          id: 1,
          title: 'iPhone 15 Pro',
          url: 'https://apple.com/iphone',
          domain: 'apple.com',
          currentPrice: '1099',
          isAvailable: true,
          lastCheckedAt: '2025-08-11T08:03:31.765Z'
        }
      ]
    };

    mockGetTrackerById.mockResolvedValue(mockTracker);

    const request = new NextRequest('http://localhost:3000/api/trackers/1');
    const response = await GET(request, { params: { trackerId: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data).toEqual(mockTracker);
    expect(mockGetTrackerById).toHaveBeenCalledWith(1);
  });

  it('should return 404 for non-existent tracker', async () => {
    mockGetTrackerById.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/trackers/999');
    const response = await GET(request, { params: { trackerId: '999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tracker not found');
    expect(mockGetTrackerById).toHaveBeenCalledWith(999);
  });

  it('should handle invalid tracker ID (non-numeric)', async () => {
    const request = new NextRequest('http://localhost:3000/api/trackers/abc');
    const response = await GET(request, { params: { trackerId: 'abc' } });
    const data = await response.json();

    // parseInt('abc', 10) returns NaN, which gets passed to getTrackerById
    expect(mockGetTrackerById).toHaveBeenCalledWith(NaN);
    expect(response.status).toBe(404); // Assuming getTrackerById returns null for NaN
  });

  it('should return 400 for missing tracker ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/trackers/');
    const response = await GET(request, { params: { trackerId: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Tracker ID is required');
    expect(mockGetTrackerById).not.toHaveBeenCalled();
  });

  it('should return 400 for undefined tracker ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/trackers/');
    const response = await GET(request, { params: { trackerId: undefined as any } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Tracker ID is required');
    expect(mockGetTrackerById).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    mockGetTrackerById.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/trackers/1');
    const response = await GET(request, { params: { trackerId: '1' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
    expect(mockGetTrackerById).toHaveBeenCalledWith(1);
  });

  it('should handle negative tracker IDs', async () => {
    mockGetTrackerById.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/trackers/-1');
    const response = await GET(request, { params: { trackerId: '-1' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tracker not found');
    expect(mockGetTrackerById).toHaveBeenCalledWith(-1);
  });

  it('should handle zero tracker ID', async () => {
    mockGetTrackerById.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/trackers/0');
    const response = await GET(request, { params: { trackerId: '0' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tracker not found');
    expect(mockGetTrackerById).toHaveBeenCalledWith(0);
  });

  it('should handle large tracker IDs', async () => {
    mockGetTrackerById.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/trackers/999999999');
    const response = await GET(request, { params: { trackerId: '999999999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Tracker not found');
    expect(mockGetTrackerById).toHaveBeenCalledWith(999999999);
  });

  it('should return tracker with no tags or listings', async () => {
    const mockTracker = {
      id: 2,
      title: 'Simple Tracker',
      description: 'Basic tracker',
      targetPrice: '50',
      userId: 1,
      createdAt: '2025-08-11T08:03:31.765Z',
      updatedAt: '2025-08-11T08:03:31.765Z',
      user: {
        id: 1,
        email: 'user@example.com'
      },
      tags: [],
      listings: []
    };

    mockGetTrackerById.mockResolvedValue(mockTracker);

    const request = new NextRequest('http://localhost:3000/api/trackers/2');
    const response = await GET(request, { params: { trackerId: '2' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockTracker);
    expect(data.tags).toHaveLength(0);
    expect(data.listings).toHaveLength(0);
  });
});