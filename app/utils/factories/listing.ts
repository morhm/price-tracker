import { Decimal } from '@prisma/client/runtime/library';

export interface ListingFactoryOptions {
  id?: number;
  trackerId?: number;
  title?: string;
  url?: string;
  domain?: string;
  currentPrice?: Decimal | number | string;
  targetPrice?: Decimal | number | string | null;
  isAvailable?: boolean;
  lastCheckedAt?: Date | string;
  createdAt?: Date | string;
}

export function createMockListing(options: ListingFactoryOptions = {}) {
  const baseUrl = 'https://example.com';
  const productId = Math.floor(Math.random() * 10000);

  return {
    id: options.id ?? Math.floor(Math.random() * 1000),
    trackerId: options.trackerId ?? 1,
    title: options.title ?? `Mock Product ${productId}`,
    url: options.url ?? `${baseUrl}/product/${productId}`,
    domain: options.domain ?? 'example.com',
    currentPrice: new Decimal(options.currentPrice ?? (Math.random() * 500 + 10).toFixed(2)).toString(),
    targetPrice: options.targetPrice !== undefined
      ? options.targetPrice === null
        ? null
        : new Decimal(options.targetPrice).toString()
      : new Decimal((Math.random() * 400 + 5).toFixed(2)).toString(),
    isAvailable: options.isAvailable ?? Math.random() > 0.1,
    lastCheckedAt: options.lastCheckedAt instanceof Date ? options.lastCheckedAt.toISOString() : (options.lastCheckedAt ?? new Date().toISOString()),
    createdAt: options.createdAt instanceof Date ? options.createdAt.toISOString() : (options.createdAt ?? new Date().toISOString()),
  };
}

export function createMockListings(count: number, baseOptions: ListingFactoryOptions = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockListing({ ...baseOptions, id: baseOptions.id ? baseOptions.id + index : undefined })
  );
}