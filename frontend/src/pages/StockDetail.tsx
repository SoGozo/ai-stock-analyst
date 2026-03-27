import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  useQuote, useFundamentals, useHistory,
  usePrediction, useSentiment, useNews,
} from "../hooks/useStockData";
import { useTickerStore } from "../store/tickerStore";
import { CandlestickChart } from "../components/charts/CandlestickChart";
import { PredictionChart } from "../components/charts/PredictionChart";
import { formatDistanceToNow } from "date-fns";

const RANGES = ["1m", "3m", "6m", "1y", "2y"] as const;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f5f5f5",
  card: "#fff",
  border: "1px solid #e8e8e8",
  divider: "#f5f5f5",
  text: "#111",
  secondary: "#777",
  muted: "#aaa",
  ghost: "#bbb",
  green: "#2d7a2d",
  red: "#b83232",
};

const card = {
  background: C.card,
  border: C.border,
  borderRadius: 12,
  padding: "16px 18px",
} as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 16 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────
function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: C.card, border: C.border, borderRadius: 10, padding: "12px 14px" }}>
      <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: C.ghost, marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

// ─── Sentiment bar ────────────────────────────────────────────────────────────
function SentimentBar({ score, label, breakdown, articlesAnalyzed, topBullish = [], topBearish = [] }: any) {
  const pct = Math.round(((score + 1) / 2) * 100);
  const color = label === "Bullish" ? C.green : label === "Bearish" ? C.red : C.secondary;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>
          {score >= 0 ? "+" : ""}{score.toFixed(3)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color }}>{label}</span>
      </div>

      {/* Track */}
      <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3, marginBottom: 6, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "#333", borderRadius: 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        {["Bearish", "Neutral", "Bullish"].map(l => (
          <span key={l} style={{ fontSize: 10, color: C.ghost }}>{l}</span>
        ))}
      </div>

      {/* Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Positive", val: breakdown.positive, bg: "#f0f7f0", col: C.green },
          { label: "Neutral",  val: breakdown.neutral,  bg: "#f5f5f5", col: C.secondary },
          { label: "Negative", val: breakdown.negative, bg: "#fdf0f0", col: C.red },
        ].map(({ label: l, val, bg, col }) => (
          <div key={l} style={{ background: bg, border: C.border, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: col, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(val * 100)}%
            </p>
            <p style={{ fontSize: 10, color: C.ghost, marginTop: 2 }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Top signals */}
      {[...topBullish.slice(0, 2), ...topBearish.slice(0, 2)].length > 0 && (
        <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          {topBullish.slice(0, 1).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, background: "#f0f7f0", color: C.green, border: "1px solid #d4ebd4", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                +{item.sentimentScore.toFixed(2)}
              </span>
              <p style={{ fontSize: 11, color: C.secondary, lineHeight: 1.4 }}>{item.title}</p>
            </div>
          ))}
          {topBearish.slice(0, 1).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 10, background: "#fdf0f0", color: C.red, border: "1px solid #f0d4d4", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {item.sentimentScore.toFixed(2)}
              </span>
              <p style={{ fontSize: 11, color: C.secondary, lineHeight: 1.4 }}>{item.title}</p>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 10, color: C.ghost, marginTop: 10 }}>{articlesAnalyzed} articles · FinBERT</p>
    </div>
  );
}

// ─── News list ────────────────────────────────────────────────────────────────
function NewsList({ articles }: { articles: any[] }) {
  if (!articles.length) return <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "20px 0" }}>No recent news.</p>;
  return (
    <div>
      {articles.slice(0, 8).map((a: any, i: number) => {
        const badge = a.sentimentLabel === "Bullish"
          ? { bg: "#f0f7f0", color: C.green }
          : a.sentimentLabel === "Bearish"
          ? { bg: "#fdf0f0", color: C.red }
          : { bg: "#f5f5f5", color: C.secondary };
        return (
          <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.divider}` : "none", padding: "11px 0" }}>
            <p style={{ fontSize: 12, color: "#333", lineHeight: 1.55, marginBottom: 6 }}>{a.title}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: C.ghost }}>
                {a.source} · {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
              </span>
              {a.sentimentLabel && (
                <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: badge.bg, color: badge.color }}>
                  {a.sentimentLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Fundamentals grid ────────────────────────────────────────────────────────
function Fundamentals({ data }: { data: any }) {
  const fmt = (n: number, prefix = "", pct = false) => {
    if (n === undefined || n === null || isNaN(n)) return "—";
    if (pct) return `${(n * 100).toFixed(2)}%`;
    return `${prefix}${n.toFixed(2)}`;
  };
  const fmtCap = (n: number) => {
    if (!n) return "—";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
    return `$${(n / 1e6).toFixed(1)}M`;
  };

  const metrics = [
    { label: "Market Cap",     value: fmtCap(data.marketCap) },
    { label: "P/E Ratio",      value: fmt(data.peRatio) },
    { label: "Forward P/E",    value: fmt(data.forwardPE) },
    { label: "EPS (TTM)",      value: fmt(data.eps, "$") },
    { label: "Dividend Yield", value: fmt(data.dividendYield, "", true) },
    { label: "Beta",           value: fmt(data.beta) },
    { label: "52W High",       value: fmt(data.week52High, "$") },
    { label: "52W Low",        value: fmt(data.week52Low, "$") },
    { label: "ROE",            value: fmt(data.returnOnEquity, "", true) },
    { label: "Profit Margin",  value: fmt(data.profitMargin, "", true) },
    { label: "Price / Book",   value: fmt(data.priceToBook) },
    { label: "Analyst Target", value: fmt(data.analystTargetPrice, "$") },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {metrics.map(({ label, value }) => (
          <div key={label} style={{ background: "#fafafa", border: C.border, borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums" }}>{value}</p>
          </div>
        ))}
      </div>

      {data.description && (
        <p style={{ fontSize: 11, color: C.secondary, lineHeight: 1.7, marginTop: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {data.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
        {[data.sector, data.industry, data.exchange].filter(Boolean).map((tag: string) => (
          <span key={tag} style={{ fontSize: 10, color: C.secondary, background: "#f5f5f5", border: C.border, borderRadius: 20, padding: "3px 10px" }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Prediction summary ───────────────────────────────────────────────────────
function PredictionSummary({ data }: { data: any }) {
  const last = data.predictions[data.predictions.length - 1];
  const isUp = data.predictions[data.predictions.length - 1]?.price > data.predictions[0]?.price;
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
      {[
        { label: "7-day forecast", value: `$${last?.price.toFixed(2) ?? "—"}`, color: isUp ? C.green : C.red },
        { label: "MAPE",           value: `${data.mape.toFixed(2)}%`,           color: C.text },
        { label: "Confidence",     value: `${data.confidence.toFixed(1)}%`,     color: C.text },
        { label: "RMSE",           value: `$${data.rmse.toFixed(2)}`,           color: C.text },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ background: "#fafafa", border: C.border, borderRadius: 8, padding: "8px 12px" }}>
          <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function StockDetail() {
  const { ticker = "AAPL" } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [range, setRange]       = useState<string>("1y");
  const [activeTab, setActiveTab] = useState<"chart" | "forecast">("chart");
  const isDemoMode = useTickerStore(s => s.isDemoMode);

  const t = ticker.toUpperCase();
  const quoteQ       = useQuote(t);
  const fundamentalsQ = useFundamentals(t);
  const historyQ     = useHistory(t, range);
  const predictionQ  = usePrediction(t, 30);
  const sentimentQ   = useSentiment(t);
  const newsQ        = useNews(t);

  const quote = quoteQ.data;
  const isUp  = (quote?.change ?? 0) >= 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif" }}>

        {/* ── Top bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 40,
          background: C.card, borderBottom: C.border,
          height: 50, display: "flex", alignItems: "center",
          padding: "0 20px", gap: 14,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: C.secondary, fontFamily: "inherit",
              padding: "4px 8px", borderRadius: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            ← Back
          </button>

          <div style={{ width: "1px", height: 18, background: "#e8e8e8" }} />

          {/* Ticker + price */}
          {quote ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t}</span>
              {fundamentalsQ.data?.name && (
                <span style={{ fontSize: 12, color: C.muted }}>{fundamentalsQ.data.name}</span>
              )}
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontVariantNumeric: "tabular-nums", marginLeft: "auto" }}>
                ${quote.price.toFixed(2)}
              </span>
              <span style={{ fontSize: 12, color: isUp ? C.green : C.red, fontVariantNumeric: "tabular-nums" }}>
                {isUp ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent})
              </span>
            </div>
          ) : (
            <div style={{ flex: 1 }}><Skel w={200} h={14} /></div>
          )}

          {isDemoMode && (
            <span style={{
              fontSize: 11, color: C.secondary, background: C.bg,
              border: C.border, borderRadius: 20, padding: "3px 10px", flexShrink: 0,
            }}>
              Demo mode
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>

          {/* ═══ LEFT ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Chart card */}
            <div style={{ ...card }}>
              {/* Tab + range row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                {/* Chart / Forecast tabs */}
                <div style={{ display: "flex", background: C.bg, border: C.border, borderRadius: 8, padding: 3, gap: 2 }}>
                  {(["chart", "forecast"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                        fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                        background: activeTab === tab ? C.text : "transparent",
                        color: activeTab === tab ? "#fff" : C.muted,
                        transition: "all 0.15s",
                      }}
                    >
                      {tab === "chart" ? "Price Chart" : "AI Forecast"}
                    </button>
                  ))}
                </div>

                {/* Range tabs */}
                {activeTab === "chart" && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {RANGES.map(r => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        style={{
                          padding: "4px 9px", borderRadius: 6, border: "none", cursor: "pointer",
                          fontFamily: "inherit", fontSize: 11, fontWeight: 500,
                          background: range === r ? C.text : "transparent",
                          color: range === r ? "#fff" : C.ghost,
                          transition: "all 0.15s",
                        }}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart content */}
              {activeTab === "chart" ? (
                historyQ.isLoading
                  ? <Skel h={300} />
                  : historyQ.data?.length
                    ? <CandlestickChart data={historyQ.data} height={300} />
                    : <p style={{ textAlign: "center", padding: "60px 0", fontSize: 13, color: C.muted }}>No chart data</p>
              ) : (
                predictionQ.isLoading
                  ? <Skel h={300} />
                  : predictionQ.data && historyQ.data?.length
                    ? <>
                        <PredictionSummary data={predictionQ.data} />
                        <PredictionChart history={historyQ.data} prediction={predictionQ.data} />
                      </>
                    : <p style={{ textAlign: "center", padding: "60px 0", fontSize: 13, color: C.muted }}>
                        {isDemoMode ? "Forecast unavailable in demo mode for this ticker" : `Training LSTM model for ${t}…`}
                      </p>
              )}
            </div>

            {/* Metrics row */}
            {quote && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                <Metric label="Open"    value={`$${quote.open.toFixed(2)}`}         sub="Today" />
                <Metric label="High"    value={`$${quote.high.toFixed(2)}`}         sub="Today" />
                <Metric label="Low"     value={`$${quote.low.toFixed(2)}`}          sub="Today" />
                <Metric label="Volume"  value={Number(quote.volume).toLocaleString()} sub="shares" />
              </div>
            )}

            {/* Fundamentals */}
            <div style={{ ...card }}>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
                Fundamental Analysis
              </p>
              {fundamentalsQ.isLoading
                ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {Array.from({ length: 12 }).map((_, i) => <Skel key={i} h={56} />)}
                  </div>
                : fundamentalsQ.data
                  ? <Fundamentals data={fundamentalsQ.data} />
                  : <p style={{ fontSize: 12, color: C.muted }}>No data available</p>
              }
            </div>
          </div>

          {/* ═══ RIGHT ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Sentiment */}
            <div style={{ ...card }}>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
                Market Sentiment
              </p>
              {sentimentQ.isLoading
                ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Skel h={24} /><Skel h={8} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{[0,1,2].map(i=><Skel key={i} h={48} />)}</div>
                  </div>
                : sentimentQ.data
                  ? <SentimentBar {...sentimentQ.data} />
                  : <p style={{ fontSize: 12, color: C.muted }}>Unavailable</p>
              }
            </div>

            {/* News */}
            <div style={{ ...card }}>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Latest News
              </p>
              {newsQ.isLoading
                ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[80, 64, 80, 64].map((h, i) => <Skel key={i} h={h} />)}
                  </div>
                : newsQ.data?.length
                  ? <NewsList articles={newsQ.data} />
                  : <p style={{ fontSize: 12, color: C.muted }}>No news available</p>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
