import axios from "axios";
import { env } from "../config/env";

const ml = axios.create({ baseURL: env.ML_SERVICE_URL, timeout: 60000 });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PredictionResult {
  ticker: string;
  predictions: { date: string; price: number; lower: number; upper: number }[];
  mape: number;
  rmse: number;
  confidence: number;
  trainedOn: number;
}

export interface SentimentResult {
  ticker: string;
  score: number;
  label: "Bullish" | "Bearish" | "Neutral";
  breakdown: { positive: number; negative: number; neutral: number };
  articlesAnalyzed: number;
}

export interface FundamentalsResult {
  ticker: string;
  name?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  currency?: string;
  marketCap?: number;
  peRatio?: number;
  forwardPE?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  returnOnEquity?: number;
  profitMargin?: number;
  analystTargetPrice?: number;
  recommendationKey?: string;
  currentPrice?: number;
  [key: string]: unknown;
}

export interface IndicatorsResult {
  ticker: string;
  source: string;
  latest: {
    rsi14?: number;
    macd_macd?: number;
    macd_signal?: number;
    macd_hist?: number;
    sma20?: number;
    sma50?: number;
    sma200?: number;
    ema12?: number;
    ema26?: number;
    bb_upper?: number;
    bb_middle?: number;
    bb_lower?: number;
  };
  series: {
    rsi: { date: string; value: number }[];
    macd: { date: string; macd: number; signal: number; hist: number }[];
    sma20: { date: string; value: number }[];
    sma50: { date: string; value: number }[];
    bbands: { date: string; upper: number; middle: number; lower: number }[];
  };
  warning?: string;
}

export interface NewsResult {
  ticker: string;
  articles: {
    title: string;
    description?: string;
    url: string;
    source: string;
    publishedAt?: string;
    urlToImage?: string;
    sentimentScore?: number;
    sentimentLabel?: string;
  }[];
  count: number;
  overallSentiment?: {
    score: number;
    label: string;
    breakdown: { positive: number; negative: number; neutral: number };
  };
}

// ─── Proxy calls ─────────────────────────────────────────────────────────────

export async function getPrediction(ticker: string, days = 30): Promise<PredictionResult> {
  const res = await ml.get<PredictionResult>(`/predict/${ticker}`, { params: { days } });
  return res.data;
}

export async function getSentiment(
  ticker: string,
  articles: { title: string; description: string | null }[]
): Promise<SentimentResult> {
  const res = await ml.post<SentimentResult>(`/sentiment/${ticker}`, { articles });
  return res.data;
}

export async function getMlFundamentals(ticker: string): Promise<FundamentalsResult> {
  const res = await ml.get<FundamentalsResult>(`/fundamentals/${ticker}`);
  return res.data;
}

export async function getMlIndicators(ticker: string, source = "local"): Promise<IndicatorsResult> {
  const res = await ml.get<IndicatorsResult>(`/indicators/${ticker}`, { params: { source } });
  return res.data;
}

export async function getMlNews(ticker: string, analyze = true): Promise<NewsResult> {
  const res = await ml.get<NewsResult>(`/news/${ticker}`, { params: { analyze } });
  return res.data;
}

export async function getMlHealth(): Promise<{ status: string }> {
  const res = await ml.get<{ status: string }>("/health");
  return res.data;
}

export interface OHLCVBar {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}

export async function getMlHistory(ticker: string, range = "1y"): Promise<{ ticker: string; range: string; bars: OHLCVBar[] }> {
  const res = await ml.get<{ ticker: string; range: string; bars: OHLCVBar[] }>(`/history/${ticker}`, { params: { range } });
  return res.data;
}
