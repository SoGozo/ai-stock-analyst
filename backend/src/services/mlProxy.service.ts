import axios from "axios";
import { env } from "../config/env";

const ml = axios.create({ baseURL: env.ML_SERVICE_URL, timeout: 60000 });

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

export async function getMlHealth(): Promise<{ status: string }> {
  const res = await ml.get<{ status: string }>("/health");
  return res.data;
}
