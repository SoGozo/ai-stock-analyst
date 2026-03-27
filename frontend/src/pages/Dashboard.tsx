import { useNavigate } from "react-router-dom";
import { TrendingUp, Brain, BarChart2, Newspaper } from "lucide-react";
import { SearchBar } from "../components/search/SearchBar";

const POPULAR = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "BRK.B"];

const FEATURES = [
  { icon: BarChart2, title: "Candlestick Charts", desc: "Real-time OHLCV data via Alpha Vantage with interactive TradingView charts" },
  { icon: Brain, title: "LSTM Price Forecast", desc: "3-layer stacked LSTM trained per-ticker with 95% confidence intervals" },
  { icon: TrendingUp, title: "Fundamental Analysis", desc: "P/E, EPS, market cap, ROE, profit margin and 12+ key metrics" },
  { icon: Newspaper, title: "FinBERT Sentiment", desc: "Financial news analyzed with a model fine-tuned on financial jargon" },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs">
          <Brain size={12} />
          LSTM + FinBERT · Real-time data
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          AI Stock Analyst
          <span className="block text-blue-400 mt-1">Dashboard</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Search any ticker for AI-powered price prediction, sentiment analysis, and fundamental data — all in one place.
        </p>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular tickers */}
      <section className="space-y-3">
        <p className="text-xs text-gray-500 text-center">Popular tickers</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR.map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/stock/${t}`)}
              className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-blue-700 hover:text-blue-300 text-sm font-mono transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center">
              <Icon size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-100">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
