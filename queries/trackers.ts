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
  isArchived?: boolean;
};

export async function getTrackers({ tagNames, sort, order, limit, offset, isArchived = false }: GetTrackersParams) {
  const where: any = {
    isArchived
  };

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

export async function updateTrackerById(trackerId: number, updateData: {
  title?: string;
  description?: string;
  targetPrice?: number | null;
  isArchived?: boolean;
  tags?: { name: string }[];
}) {
  const { title, description, targetPrice, isArchived, tags } = updateData;

  const existingTracker = await prisma.tracker.findUnique({
    where: { id: trackerId },
    include: { tags: true }
  });

  if (!existingTracker) {
    return null;
  }
  
  const userId = existingTracker.userId;
  const currentTagNames = existingTracker.tags.map(tag => tag.name);
  const newTagNames = tags ? tags.map(tag => tag.name) : [];

  const tagsToConnect = tags ? tags.filter(tag => !currentTagNames.includes(tag.name)) : [];
  const tagsToDisconnect = existingTracker.tags.filter(tag => !newTagNames.includes(tag.name));

  const updatedTracker = await prisma.tracker.update({
    where: { id: trackerId },
    data: {
      title,
      description,
      targetPrice,
      isArchived,
      tags: {
        connect: tagsToConnect.map(tag => ({
          userId_name: { userId, name: tag.name }
        })),
        disconnect: tagsToDisconnect.map(tag => ({ id: tag.id }))
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

  return updatedTracker;
}