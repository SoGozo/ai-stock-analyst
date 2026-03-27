import { apiClient } from "./client";

export const stockApi = {
  search: (q: string) =>
    apiClient.get<{ data: SearchResult[] }>("/stocks/search", { params: { q } }).then((r) => r.data.data),

  getQuote: (ticker: string) =>
    apiClient.get<{ data: Quote }>(`/stocks/${ticker}/quote`).then((r) => r.data.data),

  getFundamentals: (ticker: string) =>
    apiClient.get<{ data: Fundamentals }>(`/stocks/${ticker}/fundamentals`).then((r) => r.data.data),

  getHistory: (ticker: string, range = "1y") =>
    apiClient.get<{ data: OHLCVBar[] }>(`/stocks/${ticker}/history`, { params: { range } }).then((r) => r.data.data),

  getNews: (ticker: string) =>
    apiClient.get<{ data: NewsArticle[] }>(`/stocks/${ticker}/news`).then((r) => r.data.data),

  getPrediction: (ticker: string, days = 30) =>
    apiClient.get<{ data: PredictionResult }>(`/stocks/${ticker}/predict`, { params: { days } }).then((r) => r.data.data),

  getSentiment: (ticker: string) =>
    apiClient.get<{ data: SentimentResult }>(`/stocks/${ticker}/sentiment`).then((r) => r.data.data),
};

export interface SearchResult {
  ticker: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface Quote {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export interface Fundamentals {
  ticker: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: string;
  peRatio: string;
  eps: string;
  dividendYield: string;
  week52High: string;
  week52Low: string;
  beta: string;
  returnOnEquity: string;
  profitMargin: string;
  forwardPE: string;
  priceToBook: string;
  analystTargetPrice: string;
}

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage: string | null;
}

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
