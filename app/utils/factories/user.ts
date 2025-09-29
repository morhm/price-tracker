export interface UserFactoryOptions {
  id?: number;
  email?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function createMockUser(options: UserFactoryOptions = {}) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
  const names = ['john', 'jane', 'mike', 'sarah', 'david', 'emma', 'alex', 'lisa', 'tom', 'anna'];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return {
    id: options.id ?? Math.floor(Math.random() * 1000),
    email: options.email ?? `${randomName}${randomNumber}@${randomDomain}`,
    createdAt: options.createdAt instanceof Date ? options.createdAt.toISOString() : (options.createdAt ?? new Date().toISOString()),
    updatedAt: options.updatedAt instanceof Date ? options.updatedAt.toISOString() : (options.updatedAt ?? new Date().toISOString()),
  };
}

export function createMockUsers(count: number, baseOptions: UserFactoryOptions = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({ ...baseOptions, id: baseOptions.id ? baseOptions.id + index : undefined })
  );
}