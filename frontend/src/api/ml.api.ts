import { apiClient } from "./client";

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
      .get<{ data: NewsArticle[] }>(`/ml/news/${ticker}`)
      .then((r) => r.data.data),
};
