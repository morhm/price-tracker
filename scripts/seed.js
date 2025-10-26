const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

// Tag colors
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

function getTagColor(tagName) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'Electronics',
        userId: users[0].id,
        color: getTagColor('Electronics'),
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Books',
        userId: users[0].id,
        color: getTagColor('Books'),
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Clothing',
        userId: users[1].id,
        color: getTagColor('Clothing'),
      },
    }),
  ]);

  console.log('✅ Created tags');

  // Create trackers
  const trackers = await Promise.all([
    prisma.tracker.create({
      data: {
        title: 'iPhone 15 Pro',
        description: 'Tracking iPhone 15 Pro prices',
        targetPrice: 999.00,
        userId: users[0].id,
        tags: {
          connect: [{ id: tags[0].id }],
        },
      },
    }),
    prisma.tracker.create({
      data: {
        title: 'MacBook Air M3',
        description: 'Looking for MacBook Air deals',
        targetPrice: 1099.00,
        userId: users[0].id,
        tags: {
          connect: [{ id: tags[0].id }],
        },
      },
    }),
    prisma.tracker.create({
      data: {
        title: 'JavaScript: The Good Parts',
        description: 'Programming book',
        targetPrice: 25.00,
        userId: users[0].id,
        tags: {
          connect: [{ id: tags[1].id }],
        },
      },
    }),
    prisma.tracker.create({
      data: {
        title: 'Nike Air Max',
        description: 'Sneakers on sale',
        targetPrice: 120.00,
        userId: users[1].id,
        tags: {
          connect: [{ id: tags[2].id }],
        },
      },
    }),
  ]);

  console.log('✅ Created trackers');

  // Create listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'iPhone 15 Pro 256GB - Natural Titanium',
        url: 'https://www.apple.com/shop/buy-iphone/iphone-15-pro',
        domain: 'apple.com',
        currentPrice: 1099.00,
        targetPrice: 999.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[0].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Apple iPhone 15 Pro',
        url: 'https://www.amazon.com/dp/B0CHX2F5QT',
        domain: 'amazon.com',
        currentPrice: 1049.00,
        targetPrice: 999.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[0].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'MacBook Air 13-inch M3 Chip',
        url: 'https://www.apple.com/shop/buy-mac/macbook-air/13-inch-m3',
        domain: 'apple.com',
        currentPrice: 1199.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[1].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'MacBook Air M3',
        url: 'https://www.bestbuy.com/site/macbook-air-m3/6534606.p',
        domain: 'bestbuy.com',
        currentPrice: 1099.00,
        targetPrice: 1099.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[1].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'JavaScript: The Good Parts',
        url: 'https://www.amazon.com/dp/0596517742',
        domain: 'amazon.com',
        currentPrice: 29.99,
        targetPrice: 25.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[2].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Nike Air Max 270',
        url: 'https://www.nike.com/t/air-max-270-mens-shoes-KkLcGR',
        domain: 'nike.com',
        currentPrice: 150.00,
        targetPrice: 120.00,
        isAvailable: true,
        lastCheckedAt: new Date(),
        trackerId: trackers[3].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Nike Air Max 270 - Black/White',
        url: 'https://www.footlocker.com/product/nike-air-max-270',
        domain: 'footlocker.com',
        currentPrice: 140.00,
        targetPrice: 120.00,
        isAvailable: false,
        lastCheckedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        trackerId: trackers[3].id,
      },
    }),
  ]);

  console.log('✅ Created listings');

  // Create listing snapshots (historical price data)
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const snapshots = await Promise.all([
    // iPhone 15 Pro on Apple.com - price dropped from 1199 to 1099
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[0].id,
        price: 1199.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[0].id,
        price: 1199.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fourDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[0].id,
        price: 1149.00,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[0].id,
        price: 1099.00,
        isAvailable: true,
        source: 'cron',
        createdAt: twoDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[0].id,
        price: 1099.00,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // iPhone 15 Pro on Amazon - stable price
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[1].id,
        price: 1049.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[1].id,
        price: 1049.00,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[1].id,
        price: 1049.00,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // MacBook Air on Apple - price increased
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[2].id,
        price: 1099.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[2].id,
        price: 1149.00,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[2].id,
        price: 1199.00,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // MacBook Air on Best Buy - price dropped to target
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[3].id,
        price: 1199.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[3].id,
        price: 1149.00,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[3].id,
        price: 1099.00,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // JavaScript book - price fluctuation
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[4].id,
        price: 34.99,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[4].id,
        price: 32.99,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[4].id,
        price: 29.99,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // Nike Air Max on nike.com - stable
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[5].id,
        price: 150.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[5].id,
        price: 150.00,
        isAvailable: true,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),

    // Nike Air Max on Footlocker - went out of stock
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[6].id,
        price: 140.00,
        isAvailable: true,
        source: 'cron',
        createdAt: fiveDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[6].id,
        price: 140.00,
        isAvailable: true,
        source: 'cron',
        createdAt: threeDaysAgo,
      },
    }),
    prisma.listingSnapshot.create({
      data: {
        listingId: listings[6].id,
        price: 140.00,
        isAvailable: false,
        source: 'cron',
        createdAt: oneDayAgo,
      },
    }),
  ]);

  console.log('✅ Created listing snapshots');

  console.log('🎉 Seed completed successfully!');
  console.log(`Created:
  - ${users.length} users
  - ${tags.length} tags
  - ${trackers.length} trackers
  - ${listings.length} listings
  - ${snapshots.length} listing snapshots`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });