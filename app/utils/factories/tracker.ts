import { Decimal } from '@prisma/client/runtime/library';

export interface TrackerFactoryOptions {
  id?: number;
  userId?: number;
  title?: string;
  description?: string | null;
  targetPrice?: Decimal | number | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function createMockTracker(options: TrackerFactoryOptions = {}) {
  const products = [
    'iPhone 15 Pro',
    'MacBook Air M2',
    'Sony WH-1000XM5',
    'Samsung Galaxy S24',
    'Nintendo Switch OLED',
    'iPad Pro 12.9"',
    'AirPods Pro 2nd Gen',
    'Tesla Model 3',
    'Dyson V15',
    'PlayStation 5'
  ];

  const randomProduct = products[Math.floor(Math.random() * products.length)];

  return {
    id: options.id ?? Math.floor(Math.random() * 1000),
    userId: options.userId ?? 1,
    title: options.title ?? randomProduct,
    description: options.description ?? `Tracking price for ${randomProduct}`,
    targetPrice: options.targetPrice !== undefined
      ? options.targetPrice === null
        ? null
        : new Decimal(options.targetPrice).toString()
      : new Decimal((Math.random() * 1000 + 100).toFixed(2)).toString(),
    createdAt: options.createdAt instanceof Date ? options.createdAt.toISOString() : (options.createdAt ?? new Date().toISOString()),
    updatedAt: options.updatedAt instanceof Date ? options.updatedAt.toISOString() : (options.updatedAt ?? new Date().toISOString()),
  };
}

export function createMockTrackers(count: number, baseOptions: TrackerFactoryOptions = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockTracker({ ...baseOptions, id: baseOptions.id ? baseOptions.id + index : undefined })
  );
}