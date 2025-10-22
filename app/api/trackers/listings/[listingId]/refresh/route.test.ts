import { beforeEach, vi, it, expect, describe } from "vitest"
import { NextRequest } from "next/server"
import { POST } from './route'
import { createMockListing } from '@/app/utils/factories'

// Mock getServerSession using vi.hoisted
const mockGetServerSession = vi.hoisted(() => vi.fn());

vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    listing: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    listingSnapshot: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/app/utils/web-scrape', () => ({
  scrapeListingData: vi.fn(),
}));

const { scrapeListingData } = await import('@/app/utils/web-scrape');
const { prisma } = await import('@/lib/db');

describe('/api/trackers/listings[listingId]/refresh POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock authenticated session by default
    mockGetServerSession.mockResolvedValue({
      user: { id: '1', email: 'user@example.com' },
    });
  })

  it('should return updated listing data on successful refresh', async () => {
    const mockListing = {
      ...createMockListing({
        id: 1,
        title: 'Sample Listing',
        url: 'https://example.com/product',
        domain: 'example.com',
        currentPrice: 100,
        isAvailable: true,
        lastCheckedAt: new Date().toISOString()
      }),
      lastCheckedAt: new Date().toISOString()
    }

    const scrapedData = {
      title: 'Updated Title',
      price: 90,
      isAvailable: true,
    };

    prisma.listing.findUnique = vi.fn().mockResolvedValue(mockListing);
    prisma.listing.update = vi.fn().mockResolvedValue({
      ...mockListing,
      currentPrice: scrapedData.price,
      isAvailable: scrapedData.isAvailable,
    });
    prisma.listingSnapshot.create = vi.fn().mockResolvedValue({});

    vi.mocked(scrapeListingData).mockResolvedValue(scrapedData);

    const request = new NextRequest('http://localhost/api/trackers/listings/1/refresh', {
      method: 'POST',
    });
    const context = { params: Promise.resolve({ listingId: '1' }) };

    const response = await POST(request, context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data).toHaveProperty('id', 1);
    expect(data).toHaveProperty('currentPrice', 90);
    expect(data).toHaveProperty('isAvailable', true);

    expect(prisma.listingSnapshot.create).toHaveBeenCalledWith({
      data: {
        listingId: 1,
        price: 90,
        isAvailable: true,
        source: 'manual',
      }
    });
  })

  it('should return 404 if listing not found', async () => {
    prisma.listing.findUnique = vi.fn().mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/trackers/listings/999/refresh', {
      method: 'POST',
    });
    const context = { params: Promise.resolve({ listingId: '999' }) };

    const response = await POST(request, context);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Listing not found');
  })

  it('should return 400 for invalid listing ID', async () => {
    const request = new NextRequest('http://localhost/api/trackers/listings/abc/refresh', {
      method: 'POST',
    });
    const context = { params: Promise.resolve({ listingId: 'abc' }) };

    const response = await POST(request, context);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Listing ID is required');
  })

  it('should return 500 on scrape error', async () => {
    const mockListing = {
      ...createMockListing({
        id: 1,
        title: 'Sample Listing',
        url: 'https://example.com/product',
        domain: 'example.com',
        currentPrice: 100,
        isAvailable: true,
        lastCheckedAt: new Date().toISOString()
      }),
      lastCheckedAt: new Date().toISOString()
    }

    prisma.listing.findUnique = vi.fn().mockResolvedValue(mockListing);
    vi.mocked(scrapeListingData).mockRejectedValue(new Error('Scrape failed'));

    const request = new NextRequest('http://localhost/api/trackers/listings/1/refresh', {
      method: 'POST',
    });
    const context = { params: Promise.resolve({ listingId: '1' }) };
    
    const response = await POST(request, context);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Internal Server Error');
  })

})