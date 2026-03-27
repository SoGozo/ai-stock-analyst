import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export async function checkRedisConnection(): Promise<void> {
  await redis.ping();
}

export const CacheKeys = {
  quote: (ticker: string) => `quote:${ticker.toUpperCase()}`,
  fundamentals: (ticker: string) => `fundamentals:${ticker.toUpperCase()}`,
  history: (ticker: string, range: string) => `history:${ticker.toUpperCase()}:${range}`,
  news: (ticker: string) => `news:${ticker.toUpperCase()}`,
  prediction: (ticker: string, days: number) => `pred:${ticker.toUpperCase()}:${days}d`,
  sentiment: (ticker: string) => `sentiment:${ticker.toUpperCase()}`,
  search: (query: string) => `search:${query.toLowerCase()}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
};

export const CacheTTL = {
  quote: 60,
  fundamentals: 3600,
  history: 300,
  news: 900,
  prediction: 21600,
  sentiment: 900,
  search: 3600,
  refreshToken: 604800,
};
