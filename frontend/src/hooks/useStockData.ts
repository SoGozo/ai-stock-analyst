/**
 * Unified data hooks — transparently switches between demo fixtures
 * and live API calls based on isDemoMode from tickerStore.
 */
import { useQuery } from "@tanstack/react-query";
import { useTickerStore } from "../store/tickerStore";
import { DEMO_DATA } from "../data/demo";
import { stockApi } from "../api/stock.api";
import { mlApi } from "../api/ml.api";

const DEMO_STALE = Infinity; // demo data never goes stale

export function useQuote(ticker: string) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["quote", ticker, demo],
    queryFn: () => (demo ? DEMO_DATA[ticker]?.quote ?? null : stockApi.getQuote(ticker)),
    staleTime: demo ? DEMO_STALE : 60_000,
    refetchInterval: demo ? false : 60_000,
    enabled: !!ticker,
  });
}

export function useFundamentals(ticker: string) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["fundamentals", ticker, demo],
    queryFn: () => (demo ? DEMO_DATA[ticker]?.fundamentals ?? null : mlApi.getFundamentals(ticker)),
    staleTime: demo ? DEMO_STALE : 3_600_000,
    enabled: !!ticker,
  });
}

export function useHistory(ticker: string, range = "1y") {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["history", ticker, range, demo],
    queryFn: () => {
      if (demo) {
        const history = DEMO_DATA[ticker]?.history ?? [];
        const sliceMap: Record<string, number> = { "1m": 21, "3m": 63, "6m": 126, "1y": 252, "2y": 365 };
        return history.slice(-(sliceMap[range] ?? 252));
      }
      return stockApi.getHistory(ticker, range);
    },
    staleTime: demo ? DEMO_STALE : 300_000,
    enabled: !!ticker,
  });
}

export function usePrediction(ticker: string, days = 30) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["prediction", ticker, days, demo],
    queryFn: () => (demo ? DEMO_DATA[ticker]?.prediction ?? null : mlApi.getPrediction(ticker, days)),
    staleTime: demo ? DEMO_STALE : 3_600_000,
    enabled: !!ticker,
  });
}

export function useSentiment(ticker: string) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["sentiment", ticker, demo],
    queryFn: () => (demo ? DEMO_DATA[ticker]?.sentiment ?? null : mlApi.getSentiment(ticker)),
    staleTime: demo ? DEMO_STALE : 900_000,
    enabled: !!ticker,
  });
}

export function useNews(ticker: string) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["news", ticker, demo],
    queryFn: () => (demo ? DEMO_DATA[ticker]?.news ?? [] : mlApi.getNews(ticker)),
    staleTime: demo ? DEMO_STALE : 900_000,
    enabled: !!ticker,
  });
}

export function useSearch(query: string) {
  const demo = useTickerStore((s) => s.isDemoMode);
  return useQuery({
    queryKey: ["search", query, demo],
    queryFn: () => {
      if (demo) {
        const q = query.toLowerCase();
        return [
          { ticker: "AAPL", name: "Apple Inc.", type: "Equity", region: "United States", currency: "USD" },
          { ticker: "TSLA", name: "Tesla, Inc.", type: "Equity", region: "United States", currency: "USD" },
          { ticker: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", currency: "USD" },
        ].filter(
          (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        );
      }
      return stockApi.search(query);
    },
    staleTime: demo ? DEMO_STALE : 60_000,
    enabled: query.length >= 1,
  });
}
