export interface DemoSnapshot {
  quote: Quote;
  fundamentals: Fundamentals;
  history: OHLCVBar[];
  prediction: PredictionResult;
  sentiment: SentimentResult;
  news: NewsArticle[];
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

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionResult {
  ticker: string;
  predictions: { date: string; price: number; lower: number; upper: number }[];
  mape: number;
  rmse: number;
  mae: number;
  confidence: number;
  trainedOn: number;
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
