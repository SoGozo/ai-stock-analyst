import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { redis, CacheKeys, CacheTTL } from "../config/redis";
import * as mlProxy from "../services/mlProxy.service";

function ticker(req: Request) {
  return (req.params.ticker as string).toUpperCase();
}

export const getFundamentals = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const key = CacheKeys.fundamentals(t);
  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await mlProxy.getMlFundamentals(t);
  await redis.setex(key, CacheTTL.fundamentals, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getIndicators = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const source = (req.query.source as string) ?? "local";
  const key = `indicators:${t}:${source}`;
  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await mlProxy.getMlIndicators(t, source);
  // Indicators TTL: 15 min
  await redis.setex(key, 900, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const analyze = req.query.analyze !== "false";
  const key = `${CacheKeys.news(t)}:${analyze ? "scored" : "raw"}`;
  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await mlProxy.getMlNews(t, analyze);
  await redis.setex(key, CacheTTL.news, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getPrediction = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const days = parseInt((req.query.days as string) ?? "30");
  const key = CacheKeys.prediction(t, days);
  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await mlProxy.getPrediction(t, days);
  await redis.setex(key, CacheTTL.prediction, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getSentiment = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const key = CacheKeys.sentiment(t);
  const cached = await redis.get(key);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  // Fetch news with sentiment pre-scored from ML service
  const newsData = await mlProxy.getMlNews(t, true);
  const articles = newsData.articles.map((a) => ({ title: a.title, description: a.description ?? null }));
  const data = await mlProxy.getSentiment(t, articles);
  await redis.setex(key, CacheTTL.sentiment, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const t = ticker(req);
  const range = (req.query.range as string) ?? "1y";
  const key = `history:ml:${t}:${range}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));

  const data = await mlProxy.getMlHistory(t, range);
  await redis.setex(key, 900, JSON.stringify(data));
  res.json(data);
});

export const mlHealth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await mlProxy.getMlHealth();
  res.json({ success: true, data });
});
