import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '../app/generated/prisma';
import { getTrackers, getTrackerById } from './trackers';

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

describe('Tracker Queries', () => {
  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up all data before each test
    await prisma.listing.deleteMany();
    await prisma.tracker.deleteMany(); 
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();
  });

  // Store created entities for reference in tests
  let user1: any, user2: any, electronicsTag: any, clothesTag: any;
  let tracker1: any, tracker2: any, tracker3: any;

  describe('with test data', () => {
    beforeEach(async () => {      
      // Create users
      user1 = await prisma.user.create({
        data: { email: 'user1@test.com' }
      });
      user2 = await prisma.user.create({
        data: { email: 'user2@test.com' }
      });
      
      // Create tags
      electronicsTag = await prisma.tag.create({
        data: { name: 'Electronics', userId: user1.id }
      });

      clothesTag = await prisma.tag.create({
        data: { name: 'Clothes', userId: user1.id }
      });
      
      // Create trackers
      tracker1 = await prisma.tracker.create({
        data: {
          title: 'iPhone Tracker',
          description: 'Track iPhone prices',
          targetPrice: 999,
          userId: user1.id,
          tags: { connect: [{ id: electronicsTag.id }] }
        }
      });

      tracker2 = await prisma.tracker.create({
        data: {
          title: 'T-Shirt Tracker',
          description: 'Track T-Shirt prices',
          targetPrice: 19.99,
          userId: user1.id,
          tags: { connect: [{ id: clothesTag.id }] }
        }
      });

      tracker3 = await prisma.tracker.create({
        data: {
          title: 'Generic Tracker',
          description: 'No tags tracker',
          targetPrice: 50,
          userId: user2.id,
          tags: {}
        }
      });
      
      // Create listings
      await prisma.listing.create({
        data: {
          title: 'iPhone 15 Pro',
          url: 'https://apple.com/iphone',
          domain: 'apple.com',
          currentPrice: 1099,
          isAvailable: true,
          lastCheckedAt: new Date(),
          trackerId: tracker1.id
        }
      });

      await prisma.listing.create({
        data: {
          title: 'Cool T-Shirt',
          url: 'https://example.com/tshirt',
          domain: 'example.com',
          currentPrice: 25.99,
          isAvailable: true,
          lastCheckedAt: new Date(),
          trackerId: tracker2.id
        }
      });
    });

    it('should return trackers with pagination - no filters', async () => {
      const result = await getTrackers({ tagNames: [], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });
      
      const expectedTotal = 3;
      const expectedLength = 3;      

      expect(result.trackers).toHaveLength(expectedLength);
      expect(result.total).toBe(expectedTotal);
    });

    it('should filter trackers by tags', async () => {     
      const result = await getTrackers({ tagNames: ['Electronics'], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });

      const expectedLength = 1;
      const expectedTotal = 1;

      expect(result.trackers).toHaveLength(expectedLength);
      expect(result.total).toBe(expectedTotal);
    });

    it('should handle sorting', async () => {
      const result = await getTrackers({ tagNames: [], sort: 'title', order: 'asc', limit: 10, offset: 0 });
      
      // Verify that we got 3 results and they're sorted
      expect(result.trackers).toHaveLength(3);
      const titles = result.trackers.map(t => t.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    it('should handle pagination with offset and limit', async () => {
      const result = await getTrackers({ tagNames: [], sort: 'title', order: 'asc', limit: 2, offset: 0 });

      expect(result.trackers).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    describe('getTrackerById', () => {
      it('should return tracker with all related data', async () => {
        const result = await getTrackerById(tracker1.id);

        expect(result).toBeDefined();
        expect(result?.id).toBe(tracker1.id);
        expect(result?.title).toBe('iPhone Tracker');
        expect(result?.description).toBe('Track iPhone prices');
        expect(result?.targetPrice?.toString()).toBe('999');
        
        // Check user data
        expect(result?.user).toBeDefined();
        expect(result?.user.id).toBe(user1.id);
        expect(result?.user.email).toBe('user1@test.com');
        
        // Check tags
        expect(result?.tags).toHaveLength(1);
        expect(result?.tags[0].name).toBe('Electronics');
        
        // Check listings
        expect(result?.listings).toHaveLength(1);
        expect(result?.listings[0].title).toBe('iPhone 15 Pro');
        expect(result?.listings[0].url).toBe('https://apple.com/iphone');
        expect(result?.listings[0].domain).toBe('apple.com');
        expect(result?.listings[0].currentPrice?.toString()).toBe('1099');
        expect(result?.listings[0].isAvailable).toBe(true);
      });

      it('should return tracker with no tags', async () => {
        const result = await getTrackerById(tracker3.id);

        expect(result).toBeDefined();
        expect(result?.id).toBe(tracker3.id);
        expect(result?.title).toBe('Generic Tracker');
        expect(result?.tags).toHaveLength(0);
        expect(result?.listings).toHaveLength(0);
        expect(result?.user.id).toBe(user2.id);
      });

      it('should return tracker with no listings', async () => {
        const result = await getTrackerById(tracker2.id);

        expect(result).toBeDefined();
        expect(result?.id).toBe(tracker2.id);
        expect(result?.title).toBe('T-Shirt Tracker');
        expect(result?.tags).toHaveLength(1);
        expect(result?.tags[0].name).toBe('Clothes');
        expect(result?.listings).toHaveLength(1);
        expect(result?.listings[0].title).toBe('Cool T-Shirt');
      });

      it('should return null for non-existent tracker', async () => {
        const result = await getTrackerById(99999);
        expect(result).toBeNull();
      });

      it('should return null for invalid tracker id', async () => {
        const result = await getTrackerById(-1);
        expect(result).toBeNull();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty database', async () => {
      const result = await getTrackers({ tagNames: [], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });
      
      expect(result.trackers).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle non-existent tags', async () => {
      const result = await getTrackers({ tagNames: ['NonExistentTag'], sort: 'createdAt', order: 'desc', limit: 10, offset: 0 });
      
      expect(result.trackers).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle getTrackerById with empty database', async () => {
      const result = await getTrackerById(1);
      expect(result).toBeNull();
    });
  });
});

