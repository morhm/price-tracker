import { createClient } from 'redis';

const redisClient = await createClient({ url: process.env.REDIS_URL }).connect();
await redisClient.set('morhm', 'hello');

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client is not initialized');
  }
  
  return redisClient;
}
