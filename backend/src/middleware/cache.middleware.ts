import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";

export function cacheMiddleware(keyFn: (req: Request) => string, ttl: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch {
      // Cache miss or Redis error — continue to handler
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode === 200) {
        redis.setex(key, ttl, JSON.stringify(body)).catch(() => {});
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}
