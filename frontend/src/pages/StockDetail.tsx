import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { stockApi } from "../api/stock.api";
import { StockHeader } from "../components/stock/StockHeader";
import { FundamentalCard } from "../components/stock/FundamentalCard";
import { CandlestickChart } from "../components/charts/CandlestickChart";
import { PredictionChart } from "../components/charts/PredictionChart";
import { SentimentGauge } from "../components/charts/SentimentGauge";
import { NewsCard } from "../components/stock/NewsCard";
import { Skeleton } from "../components/ui/Skeleton";

const RANGES = ["1m", "3m", "6m", "1y", "2y"] as const;

export function StockDetail() {
  const { ticker = "" } = useParams<{ ticker: string }>();
  const [range, setRange] = useState<string>("1y");
  const [activeTab, setActiveTab] = useState<"candlestick" | "prediction">("candlestick");

  const quoteQ = useQuery({
    queryKey: ["quote", ticker],
    queryFn: () => stockApi.getQuote(ticker),
    refetchInterval: 60000,
  });

  const fundamentalsQ = useQuery({
    queryKey: ["fundamentals", ticker],
    queryFn: () => stockApi.getFundamentals(ticker),
    staleTime: 3600000,
  });

  const historyQ = useQuery({
    queryKey: ["history", ticker, range],
    queryFn: () => stockApi.getHistory(ticker, range),
    staleTime: 300000,
  });

  const newsQ = useQuery({
    queryKey: ["news", ticker],
    queryFn: () => stockApi.getNews(ticker),
    staleTime: 900000,
  });

  const predictionQ = useQuery({
    queryKey: ["prediction", ticker],
    queryFn: () => stockApi.getPrediction(ticker, 30),
    staleTime: 21600000,
    enabled: activeTab === "prediction",
  });

  const sentimentQ = useQuery({
    queryKey: ["sentiment", ticker],
    queryFn: () => stockApi.getSentiment(ticker),
    staleTime: 900000,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
        {quoteQ.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-48" />
          </div>
        ) : quoteQ.data ? (
          <StockHeader
            ticker={ticker.toUpperCase()}
            name={fundamentalsQ.data?.name}
            quote={quoteQ.data}
          />
        ) : (
          <p className="text-red-400">Failed to load quote for {ticker.toUpperCase()}</p>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart area */}
          <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("candlestick")}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    activeTab === "candlestick"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Chart
                </button>
                <button
                  onClick={() => setActiveTab("prediction")}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    activeTab === "prediction"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AI Forecast
                </button>
              </div>

              {activeTab === "candlestick" && (
                <div className="flex gap-1">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        range === r
                          ? "bg-gray-700 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeTab === "candlestick" ? (
              historyQ.isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : historyQ.data ? (
                <CandlestickChart data={historyQ.data} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-12">Failed to load chart data</p>
              )
            ) : predictionQ.isLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-80 w-full" />
              </div>
            ) : predictionQ.data && historyQ.data ? (
              <PredictionChart history={historyQ.data} prediction={predictionQ.data} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <p className="text-gray-400 text-sm">Training LSTM model for {ticker.toUpperCase()}...</p>
                <p className="text-gray-600 text-xs">This takes 30–60 seconds on first load</p>
                {predictionQ.isLoading && (
                  <div className="mt-2 animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                )}
              </div>
            )}
          </section>

          {/* Fundamentals */}
          <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Fundamental Analysis</h2>
            {fundamentalsQ.isLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : fundamentalsQ.data ? (
              <FundamentalCard data={fundamentalsQ.data} />
            ) : (
              <p className="text-gray-500 text-sm">No fundamental data available</p>
            )}
          </section>
        </div>

        {/* Right column: sentiment + news */}
        <div className="space-y-6">
          {/* Sentiment */}
          <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Market Sentiment</h2>
            {sentimentQ.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-36 w-full rounded-full" />
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              </div>
            ) : sentimentQ.data ? (
              <SentimentGauge sentiment={sentimentQ.data} />
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Sentiment unavailable</p>
            )}
          </section>

          {/* News */}
          <section className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Latest News</h2>
            {newsQ.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : newsQ.data ? (
              <NewsCard articles={newsQ.data} />
            ) : (
              <p className="text-gray-500 text-sm">No news available</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
