import { apiClient } from "./client";
import type { OHLCVBar } from "./stock.api";

export interface Fundamentals {
  ticker: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  forwardPE: number;
  eps: number;
  dividendYield: number;
  beta: number;
  week52High: number;
  week52Low: number;
  returnOnEquity: number;
  profitMargin: number;
  priceToBook: number;
  analystTargetPrice: number;
}

export interface PredictionResult {
  ticker: string;
  predictions: { date: string; price: number; lower: number; upper: number }[];
  mape: number;
  rmse: number;
  mae: number;
  confidence: number;
  trainedOn: number;
  cached?: boolean;
}

export interface SentimentResult {
  ticker: string;
  score: number;
  label: "Bullish" | "Bearish" | "Neutral";
  breakdown: { positive: number; negative: number; neutral: number };
  articlesAnalyzed: number;
  topBullish: { title: string; sentimentScore: number; sentimentLabel: string }[];
  topBearish: { title: string; sentimentScore: number; sentimentLabel: string }[];
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage: string | null;
  sentimentScore?: number;
  sentimentLabel?: string;
}

export const mlApi = {
  getFundamentals: (ticker: string) =>
    apiClient
      .get<{ data: Fundamentals }>(`/ml/fundamentals/${ticker}`)
      .then((r) => r.data.data),

  getPrediction: (ticker: string, days = 30) =>
    apiClient
      .get<{ data: PredictionResult }>(`/ml/predict/${ticker}`, { params: { days } })
      .then((r) => r.data.data),

  getSentiment: (ticker: string) =>
    apiClient
      .get<{ data: SentimentResult }>(`/ml/sentiment/${ticker}`)
      .then((r) => r.data.data),

  getNews: (ticker: string) =>
    apiClient
      .get<{ success: boolean; data: { ticker: string; articles: NewsArticle[]; count: number } }>(`/ml/news/${ticker}`)
      .then((r) => r.data.data.articles),

  getHistory: (ticker: string, range = "1y") =>
    apiClient
      .get<{ bars: OHLCVBar[] }>(`/ml/history/${ticker}`, { params: { range } })
      .then((r) => r.data.bars),

  getQuote: (ticker: string) =>
    apiClient
      .get<{ bars: OHLCVBar[] }>(`/ml/history/${ticker}`, { params: { range: "5d" } })
      .then((r) => {
        const bars = r.data.bars;
        const last = bars[bars.length - 1];
        const prev = bars[bars.length - 2] ?? last;
        const change = Math.round((last.close - prev.close) * 100) / 100;
        const changePct = ((change / prev.close) * 100).toFixed(2);
        return {
          ticker,
          price: last.close,
          open: last.open,
          high: last.high,
          low: last.low,
          volume: last.volume,
          latestTradingDay: last.date,
          previousClose: prev.close,
          change,
          changePercent: `${changePct}%`,
        };
      }),
};
