import { Router } from "express";
import * as ml from "../controllers/ml.controller";

const router = Router();

// Fundamentals (yfinance via ML service)
router.get("/fundamentals/:ticker", ml.getFundamentals);

// Technical indicators (RSI, MACD, SMA, EMA, Bollinger Bands)
router.get("/indicators/:ticker", ml.getIndicators);

// News with FinBERT sentiment
router.get("/news/:ticker", ml.getNews);

// LSTM price prediction
router.get("/predict/:ticker", ml.getPrediction);

// Aggregate sentiment
router.get("/sentiment/:ticker", ml.getSentiment);

// OHLCV history via yfinance
router.get("/history/:ticker", ml.getHistory);

// ML service health
router.get("/health", ml.mlHealth);

export default router;
