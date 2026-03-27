import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { redis, CacheKeys, CacheTTL } from "../config/redis";
import * as av from "../services/alphaVantage.service";
import * as newsApi from "../services/newsapi.service";
import * as mlProxy from "../services/mlProxy.service";
import { db } from "../config/db";

function param(req: Request, key: string): string {
  return req.params[key] as string;
}

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 1) return res.json({ success: true, data: [] });

  const cacheKey = CacheKeys.search(q);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const results = await av.searchSymbol(q);
  await redis.setex(cacheKey, CacheTTL.search, JSON.stringify(results));
  res.json({ success: true, data: results });
});

export const getQuote = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const cacheKey = CacheKeys.quote(ticker);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await av.getQuote(ticker);
  await redis.setex(cacheKey, CacheTTL.quote, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getFundamentals = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const cacheKey = CacheKeys.fundamentals(ticker);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await av.getFundamentals(ticker);
  await redis.setex(cacheKey, CacheTTL.fundamentals, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const range = (req.query.range as string) ?? "1y";
  const cacheKey = CacheKeys.history(ticker, range);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const allData = await av.getDailyHistory(ticker);

  const daysMap: Record<string, number> = { "1m": 30, "3m": 90, "6m": 180, "1y": 365, "2y": 730, "5y": 1825 };
  const days = daysMap[range] ?? 365;
  const data = allData.slice(0, days);

  await redis.setex(cacheKey, CacheTTL.history, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const cacheKey = CacheKeys.news(ticker);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const articles = await newsApi.getStockNews(ticker);
  await redis.setex(cacheKey, CacheTTL.news, JSON.stringify(articles));
  res.json({ success: true, data: articles });
});

export const getPrediction = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const days = parseInt((req.query.days as string) ?? "30");
  const cacheKey = CacheKeys.prediction(ticker, days);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const data = await mlProxy.getPrediction(ticker, days);
  await redis.setex(cacheKey, CacheTTL.prediction, JSON.stringify(data));
  res.json({ success: true, data });
});

export const getSentiment = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const cacheKey = CacheKeys.sentiment(ticker);
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const newsKey = CacheKeys.news(ticker);
  let articles: newsApi.NewsArticle[];
  const cachedNews = await redis.get(newsKey);
  if (cachedNews) {
    articles = JSON.parse(cachedNews);
  } else {
    articles = await newsApi.getStockNews(ticker);
    await redis.setex(newsKey, CacheTTL.news, JSON.stringify(articles));
  }

  const sentimentInput = articles.map((a) => ({ title: a.title, description: a.description }));
  const data = await mlProxy.getSentiment(ticker, sentimentInput);
  await redis.setex(cacheKey, CacheTTL.sentiment, JSON.stringify(data));
  res.json({ success: true, data });
});

export const addSearchHistory = asyncHandler(async (req: Request, res: Response) => {
  const ticker = param(req, "ticker");
  const userId = req.user?.userId ?? null;
  if (userId) {
    await db.query(`INSERT INTO search_history (user_id, ticker) VALUES ($1, $2)`, [userId, ticker.toUpperCase()]);
  }
  res.json({ success: true });
});
