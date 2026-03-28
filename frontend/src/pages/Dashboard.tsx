import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTickerStore } from "../store/tickerStore";
import { useSearch } from "../hooks/useStockData";

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="#aaa" strokeWidth="1.5" />
    <path d="M11 11L14.5 14.5" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <polyline points="1,13 5,8 9,10 13,4 15,6" stroke="#555" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2C5.8 2 4 3.8 4 6c0 1.1.4 2 1.1 2.7C4.4 9.2 4 10.1 4 11c0 1.7 1.3 3 3 3h2c1.7 0 3-1.3 3-3 0-.9-.4-1.8-1.1-2.3C11.6 8 12 7.1 12 6c0-2.2-1.8-4-4-4z" stroke="#555" strokeWidth="1.4" />
    <line x1="8" y1="2" x2="8" y2="5" stroke="#555" strokeWidth="1.4" />
    <line x1="5.5" y1="7.5" x2="10.5" y2="7.5" stroke="#555" strokeWidth="1.2" />
  </svg>
);
const IconNewspaper = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="12" rx="2" stroke="#555" strokeWidth="1.4" />
    <line x1="4" y1="6" x2="12" y2="6" stroke="#555" strokeWidth="1.2" />
    <line x1="4" y1="9" x2="9" y2="9" stroke="#555" strokeWidth="1.2" />
    <line x1="4" y1="12" x2="7" y2="12" stroke="#555" strokeWidth="1.2" />
  </svg>
);
const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <polyline points="1,12 6,7 10,9 15,3" stroke="#555" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    <polyline points="11,3 15,3 15,7" stroke="#555" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const DEMO_TICKERS = ["AAPL", "TSLA", "MSFT"];
const ALL_POPULAR  = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META"];

const FEATURES = [
  { Icon: IconChart,     title: "Candlestick Charts",   desc: "Interactive OHLCV charts with TradingView lightweight-charts and range selector" },
  { Icon: IconBrain,     title: "LSTM Price Forecast",  desc: "Stacked LSTM trained per-ticker, 30-day recursive forecast with 95% confidence band" },
  { Icon: IconTrend,     title: "Fundamental Analysis", desc: "P/E, EPS, market cap, ROE, profit margin and 12+ key metrics via yfinance" },
  { Icon: IconNewspaper, title: "FinBERT Sentiment",    desc: "News headlines scored with ProsusAI/finbert — composite score −1 to +1" },
];

// ─── Search component ─────────────────────────────────────────────────────────
function SearchBox() {
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const navigate            = useNavigate();
  const { pushRecentSearch } = useTickerStore();
  const ref                 = useRef<HTMLDivElement>(null);
  const { data: results = [] } = useSearch(query);

  useEffect(() => {
    setOpen(query.length >= 1 && results.length > 0);
  }, [query, results]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (ticker: string) => {
    pushRecentSearch(ticker.toUpperCase());
    setQuery("");
    setOpen(false);
    navigate(`/stock/${ticker.toUpperCase()}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      go(query.trim().toUpperCase());
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 520 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", border: "1px solid #e8e8e8",
        borderRadius: 12, padding: "0 16px", height: 52,
      }}>
        <IconSearch />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search ticker or company name…"
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: 15, color: "#111", fontFamily: "inherit",
            background: "transparent",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#bbb", fontSize: 18, lineHeight: 1, padding: 0 }}
          >×</button>
        )}
        <button
          onClick={() => query.trim() && go(query.trim())}
          style={{
            background: "#111", color: "#fff", border: "none",
            borderRadius: 8, padding: "6px 14px",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Analyse →
        </button>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 100, overflow: "hidden",
        }}>
          {results.slice(0, 7).map((r) => (
            <button
              key={r.ticker}
              onClick={() => go(r.ticker)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "11px 16px",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: "1px solid #f5f5f5", fontFamily: "inherit",
                textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111", fontVariantNumeric: "tabular-nums" }}>
                  {r.ticker}
                </span>
                <span style={{ fontSize: 12, color: "#888", marginLeft: 10 }}>{r.name}</span>
              </div>
              <span style={{ fontSize: 11, color: "#bbb" }}>{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { isDemoMode, setDemoMode, watchlist } = useTickerStore();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f5f5f5; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff", borderBottom: "1px solid #e8e8e8",
        height: 50, display: "flex", alignItems: "center",
        padding: "0 24px", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "#111", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="1,11 4,7 7,8.5 13,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111", fontFamily: "Inter, sans-serif" }}>
            StockAI
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Guide */}
          <Link
            to="/guide"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 8,
              border: "1px solid #e8e8e8", background: "#fff",
              fontSize: 12, fontWeight: 500, color: "#555",
              textDecoration: "none", fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h4.5c1 0 1.5.5 1.5 1.5v9S7 12 5.5 12H2V3z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M14 3H9.5C8.5 3 8 3.5 8 4.5v9s1-1.5 2.5-1.5H14V3z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            Guide
          </Link>

          {/* Demo / Live toggle */}
          <button
            onClick={() => setDemoMode(!isDemoMode)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20, cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 500,
              border: "1px solid #e8e8e8",
              background: isDemoMode ? "#f5f5f5" : "#fff",
              color: "#555",
              transition: "all 0.15s",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isDemoMode ? "#888" : "#2d7a2d",
              flexShrink: 0,
            }} />
            {isDemoMode ? "Demo mode" : "Live mode"}
          </button>

          {/* Sign in */}
          <Link
            to="/login"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 8,
              background: "#111", color: "#fff",
              fontSize: 12, fontWeight: 600,
              textDecoration: "none", fontFamily: "inherit",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{
        maxWidth: 680, margin: "0 auto",
        padding: "72px 24px 48px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 20, textAlign: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 12px", borderRadius: 20,
          border: "1px solid #e8e8e8", background: "#fff",
          fontSize: 11, color: "#777",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2d7a2d" }} />
          LSTM + FinBERT · {isDemoMode ? "Demo mode" : "Live data"}
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 42, fontWeight: 600, color: "#111", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          AI Stock Analyst
          <span style={{ display: "block", color: "#555", fontWeight: 400, fontSize: 36 }}>
            Dashboard
          </span>
        </h1>

        <p style={{ fontSize: 15, color: "#777", lineHeight: 1.7, maxWidth: 480 }}>
          Search any ticker for AI-powered price prediction, FinBERT sentiment analysis,
          and fundamental data — all in one place.
        </p>

        {/* Search */}
        <div style={{ width: "100%", marginTop: 8 }}>
          <SearchBox />
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 10 }}>
            Press Enter or click Analyse →
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid #e8e8e8", maxWidth: 680, margin: "0 auto" }} />

      {/* ── Popular / Demo tickers ── */}
      <div style={{
        maxWidth: 680, margin: "0 auto",
        padding: "36px 24px",
        fontFamily: "Inter, sans-serif",
      }}>
        <p style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14, textAlign: "center" }}>
          {isDemoMode ? "Demo tickers — full data pre-loaded" : "Popular tickers"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {(isDemoMode ? DEMO_TICKERS : ALL_POPULAR).map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/stock/${t}`)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: "1px solid #e8e8e8", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "#111",
                cursor: "pointer", fontFamily: "inherit",
                fontVariantNumeric: "tabular-nums",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#bbb"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}
            >
              {t}
            </button>
          ))}
        </div>
        {isDemoMode && (
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 10 }}>
            Only AAPL, TSLA, MSFT have simulated data. Switch to live mode for all tickers.
          </p>
        )}
      </div>

      {/* ── Watchlist (if any) ── */}
      {watchlist.length > 0 && (
        <div style={{
          maxWidth: 680, margin: "0 auto",
          padding: "0 24px 36px",
          fontFamily: "Inter, sans-serif",
        }}>
          <div style={{
            background: "#fff", border: "1px solid #e8e8e8",
            borderRadius: 12, padding: "16px 20px",
          }}>
            <p style={{ fontSize: 11, color: "#888", fontWeight: 500, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Watchlist
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {watchlist.map((t) => (
                <button
                  key={t}
                  onClick={() => navigate(`/stock/${t}`)}
                  style={{
                    padding: "6px 14px", borderRadius: 8,
                    border: "1px solid #e8e8e8", background: "#f5f5f5",
                    fontSize: 12, fontWeight: 600, color: "#111",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#bbb"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.borderColor = "#e8e8e8"; }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Features grid ── */}
      <div style={{
        maxWidth: 680, margin: "0 auto",
        padding: "0 24px 80px",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}>
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "#fff", border: "1px solid #e8e8e8",
                borderRadius: 10, padding: "16px 18px",
                display: "flex", gap: 12,
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "#f5f5f5", border: "1px solid #e8e8e8",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { Dashboard };
