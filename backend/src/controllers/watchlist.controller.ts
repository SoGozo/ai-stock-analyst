import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as model from "../models/watchlist.model";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";

const addSchema = z.object({ ticker: z.string().min(1).max(10).toUpperCase() });

export const getWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const entries = await model.getWatchlist(req.user!.userId);
  res.json({ success: true, data: entries });
});

export const addTicker = asyncHandler(async (req: Request, res: Response) => {
  const { ticker } = addSchema.parse(req.body);
  const entry = await model.addToWatchlist(req.user!.userId, ticker);
  if (!entry) throw ApiError.badRequest("Ticker already in watchlist");
  res.status(201).json({ success: true, data: entry });
});

export const removeTicker = asyncHandler(async (req: Request, res: Response) => {
  const removed = await model.removeFromWatchlist(req.user!.userId, req.params.ticker as string);
  if (!removed) throw ApiError.notFound("Ticker not in watchlist");
  res.json({ success: true, message: "Removed from watchlist" });
});
