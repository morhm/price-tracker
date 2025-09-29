export interface TagFactoryOptions {
  id?: number;
  userId?: number;
  name?: string;
  createdAt?: Date | string;
}

export function createMockTag(options: TagFactoryOptions = {}) {
  const tagNames = [
    'electronics',
    'home',
    'gaming',
    'fashion',
    'books',
    'sports',
    'automotive',
    'health',
    'toys',
    'music',
    'urgent',
    'wishlist',
    'deals',
    'holiday',
    'gift'
  ];

  const randomTag = tagNames[Math.floor(Math.random() * tagNames.length)];

  return {
    id: options.id ?? Math.floor(Math.random() * 1000),
    userId: options.userId ?? 1,
    name: options.name ?? randomTag,
    createdAt: options.createdAt instanceof Date ? options.createdAt.toISOString() : (options.createdAt ?? new Date().toISOString()),
  };
}

export function createMockTags(count: number, baseOptions: TagFactoryOptions = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockTag({ ...baseOptions, id: baseOptions.id ? baseOptions.id + index : undefined })
  );
}