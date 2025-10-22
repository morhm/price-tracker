import { beforeEach, vi, it, expect, describe } from "vitest"
import { NextRequest } from "next/server"
import { GET } from './route'

vi.mock('@/queries/listingSnapshots', () => ({
  getListingSnapshotsByListingId: vi.fn(),
}));

const { getListingSnapshotsByListingId } = await import('@/queries/listingSnapshots');

describe('/api/listings/[listingId]/snapshots GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it('should return listing snapshots for valid listing ID', async () => {
    const mockSnapshots = [
      {
        id: 1,
        listingId: 1,
        price: 90,
        isAvailable: true,
        source: 'manual',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 2,
        listingId: 1,
        price: 100,
        isAvailable: true,
        source: 'scheduled',
        createdAt: new Date('2024-01-14T10:00:00Z'),
      },
    ];

    vi.mocked(getListingSnapshotsByListingId).mockResolvedValue(mockSnapshots);

    const request = new NextRequest('http://localhost/api/listings/1/snapshots', {
      method: 'GET',
    });
    const context = {
      params: Promise.resolve({
        listingId: '1'
      })
    };

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('listingSnapshots');
    expect(data.listingSnapshots).toHaveLength(2);
    expect(data.listingSnapshots[0]).toMatchObject({
      id: 1,
      listingId: 1,
      price: 90,
      isAvailable: true,
      source: 'manual',
    });
    expect(getListingSnapshotsByListingId).toHaveBeenCalledWith(1);
  })

  it('should return empty array when no snapshots exist', async () => {
    vi.mocked(getListingSnapshotsByListingId).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/listings/1/snapshots', {
      method: 'GET',
    });
    const context = {
      params: Promise.resolve({
        listingId: '1'
      })
    };

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('listingSnapshots');
    expect(data.listingSnapshots).toHaveLength(0);
    expect(getListingSnapshotsByListingId).toHaveBeenCalledWith(1);
  })

  it('should return 400 for invalid listing ID', async () => {
    const request = new NextRequest('http://localhost/api/listings/abc/snapshots', {
      method: 'GET',
    });
    const context = {
      params: Promise.resolve({
        listingId: 'abc'
      })
    };

    const response = await GET(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Invalid listing ID');
    expect(getListingSnapshotsByListingId).not.toHaveBeenCalled();
  })

  it('should return 400 for non-numeric listing ID', async () => {
    const request = new NextRequest('http://localhost/api/listings/xyz/snapshots', {
      method: 'GET',
    });
    const context = {
      params: Promise.resolve({
        listingId: 'xyz'
      })
    };

    const response = await GET(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Invalid listing ID');
  })

  it('should return 500 on database error', async () => {
    vi.mocked(getListingSnapshotsByListingId).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/listings/1/snapshots', {
      method: 'GET',
    });
    const context = {
      params: Promise.resolve({
        listingId: '1'
      })
    };

    const response = await GET(request, context);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Internal Server Error');
  })
})