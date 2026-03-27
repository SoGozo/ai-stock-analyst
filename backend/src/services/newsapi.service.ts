import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: "https://newsapi.org/v2",
  timeout: 8000,
  headers: { "X-Api-Key": env.NEWS_API_KEY },
});

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage: string | null;
}

export async function getStockNews(ticker: string, companyName?: string): Promise<NewsArticle[]> {
  const query = companyName ? `${ticker} OR "${companyName}"` : ticker;

  const res = await client.get("/everything", {
    params: {
      q: query,
      language: "en",
      sortBy: "publishedAt",
      pageSize: 30,
      domains: "reuters.com,bloomberg.com,cnbc.com,wsj.com,marketwatch.com,finance.yahoo.com",
    },
  });

  return (res.data.articles ?? []).map((a: Record<string, unknown>) => ({
    title: a.title as string,
    description: a.description as string | null,
    url: a.url as string,
    source: (a.source as { name: string }).name,
    publishedAt: a.publishedAt as string,
    urlToImage: a.urlToImage as string | null,
  }));
}
