import { prisma } from '@/lib/db';

export async function getTrackerById(trackerId: number) {
  const tracker = await prisma.tracker.findUnique({
    where: { id: trackerId },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      },
      tags: true,
      listings: {
        select: {
          id: true,
          title: true,
          url: true,
          domain: true,
          currentPrice: true,
          isAvailable: true,
          lastCheckedAt: true
        }
      }
    }
  });
  return tracker;
}

type GetTrackersParams = {
  tagNames: string[];
  sort: string;
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
};

export async function getTrackers({ tagNames, sort, order, limit, offset }: GetTrackersParams) {
  const where: any = {};
  if (tagNames.length > 0) {
    where.tags = {
      some: {
        name: {
          in: tagNames
        }
      }
    };
  }

  const findManyQuery = {
    where,
    orderBy: {
      [sort]: order
    },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      },
      tags: true,
      listings: {
        select: {
          id: true,
          title: true,
          url: true,
          domain: true,
          currentPrice: true,
          isAvailable: true,
          lastCheckedAt: true
        }
      },
      _count: {
        select: {
          listings: true
        }
      }
    }
  }

  const [ trackers, total ] = await Promise.all([
    prisma.tracker.findMany(findManyQuery),
    prisma.tracker.count({ where })
  ])

  return {
    trackers: trackers,
    total
  }
}

export async function createNewTracker(trackerData: {
  title: string;
  description: string;
  userId: number;
  targetPrice: number | null;
  tags: { name: string }[];
}) {
  const { title, description, userId, targetPrice, tags } = trackerData;

  const newTracker = await prisma.tracker.create({
    data: {
      title,
      description,
      userId,
      targetPrice,
      tags: {
        connect: tags.map(tag => ({
          userId_name: { userId, name: tag.name }
        }))
      }
    },
    include: {
      tags: true,
      listings: true,
      _count: {
        select: { listings: true }
      }
    }
  });

  return newTracker;
}
