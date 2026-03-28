import { useState } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#f5f5f5",
  card: "#fff",
  border: "1px solid #e8e8e8",
  text: "#111",
  secondary: "#555",
  muted: "#777",
  ghost: "#bbb",
  green: "#2d7a2d",
  red: "#b83232",
  accent: "#f9f9f9",
};

interface Term {
  term: string;
  short: string;
  detail: string;
  example?: string;
  tip?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  terms: Term[];
}

const SECTIONS: Section[] = [
  {
    id: "fundamentals",
    title: "Fundamental Metrics",
    description: "Key financial ratios and numbers that help you evaluate a company's financial health and valuation.",
    terms: [
      {
        term: "Market Cap",
        short: "Total market value of a company's outstanding shares.",
        detail: "Market Capitalization = Current Share Price x Total Outstanding Shares. It tells you the total value the market places on a company. Companies are often categorized as large-cap ($10B+), mid-cap ($2B-$10B), or small-cap (under $2B).",
        example: "If a company has 1 billion shares outstanding at $150 each, its market cap is $150 billion.",
        tip: "A high market cap doesn't mean a stock is expensive — it just means the company is large. Compare P/E ratios instead for valuation.",
      },
      {
        term: "P/E Ratio (Price-to-Earnings)",
        short: "How much investors pay per dollar of earnings.",
        detail: "P/E Ratio = Share Price / Earnings Per Share (EPS). A higher P/E means investors are willing to pay more for each dollar of earnings, often because they expect higher growth. The trailing P/E uses the last 12 months of earnings.",
        example: "A stock at $100 with EPS of $5 has a P/E of 20 — investors pay $20 for every $1 of profit.",
        tip: "Compare P/E within the same industry. A tech company with P/E of 30 may be reasonable, while a utility at 30 could be overvalued.",
      },
      {
        term: "Forward P/E",
        short: "P/E ratio based on estimated future earnings.",
        detail: "Forward P/E = Current Share Price / Estimated Future EPS. Unlike trailing P/E (which looks backward), forward P/E uses analyst projections for the next 12 months. A lower forward P/E vs trailing P/E suggests analysts expect earnings growth.",
        example: "If a stock trades at $100 and analysts estimate next year's EPS at $8, the forward P/E is 12.5.",
        tip: "If forward P/E is much lower than trailing P/E, the market expects strong earnings growth ahead.",
      },
      {
        term: "EPS (Earnings Per Share)",
        short: "Profit allocated to each outstanding share.",
        detail: "EPS = (Net Income - Preferred Dividends) / Weighted Average Shares Outstanding. It's the most direct measure of a company's profitability on a per-share basis. TTM means 'Trailing Twelve Months' — the last 4 quarters combined.",
        example: "A company earning $1 billion with 200 million shares has EPS of $5.00.",
        tip: "Watch for EPS growth quarter-over-quarter and year-over-year. Consistent EPS growth is a strong bullish signal.",
      },
      {
        term: "Dividend Yield",
        short: "Annual dividend income as a percentage of share price.",
        detail: "Dividend Yield = Annual Dividends Per Share / Current Share Price. It shows how much cash flow you're getting for each dollar invested. Not all companies pay dividends — growth companies often reinvest profits instead.",
        example: "A stock at $100 paying $3/year in dividends has a 3% yield.",
        tip: "Very high yields (8%+) can be a red flag — it may mean the stock price has dropped sharply or the dividend is unsustainable.",
      },
      {
        term: "Beta",
        short: "Measures a stock's volatility relative to the market.",
        detail: "Beta compares a stock's price swings to the overall market (S&P 500 = beta of 1.0). A beta above 1 means the stock is more volatile than the market; below 1 means it's less volatile. Negative beta means it moves opposite to the market.",
        example: "Beta of 1.5 means when the market goes up 10%, this stock tends to go up 15% (and vice versa).",
        tip: "High-beta stocks offer higher potential returns but also higher risk. Conservative investors often prefer beta under 1.",
      },
      {
        term: "52-Week High / Low",
        short: "Highest and lowest prices in the past year.",
        detail: "These show the trading range over the last 52 weeks (1 year). They help gauge where the current price sits relative to its recent history. A stock near its 52W high may signal momentum; near its 52W low may signal a buying opportunity or trouble.",
        example: "52W High: $200, 52W Low: $120, Current: $180 — the stock is trading near the top of its yearly range.",
        tip: "Stocks hitting new 52W highs often continue higher (momentum). But always check why before buying.",
      },
      {
        term: "ROE (Return on Equity)",
        short: "How efficiently a company generates profit from shareholder equity.",
        detail: "ROE = Net Income / Shareholders' Equity. It measures how well management uses investors' money to generate profits. A consistently high ROE (15%+) is generally a sign of a well-run, competitive business.",
        example: "A company with $500M net income and $2B in equity has ROE of 25% — excellent.",
        tip: "Compare ROE within the same sector. Banks typically have lower ROE than tech companies.",
      },
      {
        term: "Profit Margin",
        short: "Percentage of revenue that becomes profit.",
        detail: "Net Profit Margin = Net Income / Revenue x 100. It tells you how many cents of profit a company makes for every dollar of revenue. Higher margins generally indicate better pricing power and cost management.",
        example: "Revenue of $10B with net income of $2.5B = 25% profit margin.",
        tip: "Software companies often have 20-40% margins. Retail/grocery may have 1-5%. Always compare within the same industry.",
      },
      {
        term: "Price / Book (P/B Ratio)",
        short: "Share price relative to the book value per share.",
        detail: "P/B Ratio = Market Price Per Share / Book Value Per Share. Book value is essentially what would be left if the company sold all assets and paid all debts. A P/B under 1 could mean the stock is undervalued or the company has problems.",
        example: "A stock at $50 with book value of $25/share has a P/B ratio of 2.",
        tip: "P/B is most useful for banks, insurance, and asset-heavy industries. Less relevant for tech companies whose value is in IP.",
      },
      {
        term: "Analyst Target Price",
        short: "Average price target from Wall Street analysts.",
        detail: "This is the consensus price target — the average of estimates from analysts covering the stock. Analysts set 12-month price targets based on their valuation models. If the current price is below the target, analysts expect upside.",
        example: "Current price $150, analyst target $180 = analysts see ~20% upside potential.",
        tip: "Analyst targets are opinions, not guarantees. They tend to be overly optimistic. Use as one data point, not the only one.",
      },
    ],
  },
  {
    id: "trading",
    title: "Trading & Charts",
    description: "Understanding price charts, candlesticks, and technical indicators used for timing trades.",
    terms: [
      {
        term: "OHLCV (Candlestick Data)",
        short: "Open, High, Low, Close, Volume — the five key data points for each trading period.",
        detail: "Each candlestick on a chart represents one time period (day, hour, etc.). Open = first trade price, High = highest price, Low = lowest price, Close = last trade price, Volume = total shares traded. A green candle means close > open (price went up); red means close < open (price went down).",
        example: "A daily candle: Open $150, High $155, Low $148, Close $153, Volume 5M shares.",
        tip: "Long wicks (shadows) on candles indicate that price was pushed back — a sign of buying/selling pressure.",
      },
      {
        term: "RSI (Relative Strength Index)",
        short: "Momentum indicator measuring speed and magnitude of price changes (0-100).",
        detail: "RSI compares recent gains to recent losses over a period (usually 14 days). RSI above 70 suggests a stock may be overbought (due for a pullback). RSI below 30 suggests it may be oversold (due for a bounce).",
        example: "RSI at 78 after a big rally — the stock may be overbought and could pull back soon.",
        tip: "RSI works best in range-bound markets. In strong trends, a stock can stay overbought for weeks.",
      },
      {
        term: "MACD (Moving Average Convergence Divergence)",
        short: "Trend-following momentum indicator showing relationship between two moving averages.",
        detail: "MACD = 12-period EMA minus 26-period EMA. A signal line (9-period EMA of MACD) is plotted on top. When MACD crosses above the signal line, it's a bullish signal. When it crosses below, it's bearish. The histogram shows the distance between them.",
        example: "MACD line crosses above signal line while both are below zero — a potential trend reversal to the upside.",
        tip: "MACD is a lagging indicator — it confirms trends rather than predicting them. Use with RSI for better signals.",
      },
      {
        term: "SMA (Simple Moving Average)",
        short: "Average closing price over a specified number of periods.",
        detail: "SMA adds up closing prices for N periods and divides by N. Common periods: SMA 20 (short-term), SMA 50 (medium-term), SMA 200 (long-term). When price is above the SMA, the trend is generally up. When the SMA 50 crosses above SMA 200, it's called a 'Golden Cross' (bullish).",
        example: "SMA 50 at $145, stock price at $160 — price is well above the medium-term average, trend is bullish.",
        tip: "The SMA 200 is the most watched moving average. Institutional investors often use it to determine the overall trend.",
      },
      {
        term: "EMA (Exponential Moving Average)",
        short: "Weighted moving average that gives more importance to recent prices.",
        detail: "Unlike SMA which weights all prices equally, EMA gives more weight to recent prices, making it more responsive to new information. EMA 12 and EMA 26 are the most common (used in MACD calculation).",
        example: "EMA reacts faster to a sudden price drop than SMA would, giving earlier exit signals.",
        tip: "Use EMA for short-term trading signals and SMA for long-term trend identification.",
      },
      {
        term: "Bollinger Bands",
        short: "Volatility bands placed above and below a moving average.",
        detail: "Bollinger Bands consist of a middle band (SMA 20) and upper/lower bands at 2 standard deviations from the middle. When bands widen, volatility is increasing. When they contract (squeeze), a big move is often coming. Price touching the upper band suggests overbought; lower band suggests oversold.",
        example: "Bands squeezing tight after weeks of low volatility — expect a breakout in either direction soon.",
        tip: "Bollinger Band squeeze is one of the most reliable setups. The direction of the breakout tells you which way to trade.",
      },
      {
        term: "Volume",
        short: "Total number of shares traded in a given period.",
        detail: "Volume confirms price movements. A price increase on high volume is more significant than one on low volume. Volume spikes often occur at turning points. Average daily volume helps you understand a stock's liquidity.",
        example: "Stock jumps 5% on 3x average volume — strong conviction behind the move.",
        tip: "Always check volume when analyzing price action. Price moves without volume are less trustworthy.",
      },
    ],
  },
  {
    id: "sentiment",
    title: "Sentiment Analysis",
    description: "How AI and NLP are used to gauge market mood from news, social media, and financial reports.",
    terms: [
      {
        term: "FinBERT Sentiment Score",
        short: "AI-generated sentiment score from financial news headlines (-1 to +1).",
        detail: "FinBERT is a pre-trained NLP model specialized for financial text. It analyzes news headlines and assigns a sentiment score: positive (bullish), negative (bearish), or neutral. Our dashboard aggregates scores across multiple articles to give a composite sentiment reading.",
        example: "Score of +0.45 from 20 articles — moderately bullish sentiment in recent news coverage.",
        tip: "Sentiment is a contrarian indicator at extremes. Extremely bullish sentiment often precedes pullbacks.",
      },
      {
        term: "Bullish / Bearish / Neutral",
        short: "Market outlook classifications based on expected price direction.",
        detail: "Bullish = expecting prices to rise. Bearish = expecting prices to fall. Neutral = no strong directional view. These terms come from how each animal attacks: bulls thrust horns up, bears swipe paws down.",
        example: "Sentiment breakdown: 60% bullish, 25% neutral, 15% bearish — overall positive market mood.",
      },
      {
        term: "Sentiment Breakdown",
        short: "Percentage split of positive, negative, and neutral signals.",
        detail: "Rather than a single number, the breakdown shows what proportion of analyzed content is positive, negative, or neutral. This gives a more nuanced view — a score of 0 could mean all neutral or equal positive and negative (very different situations).",
        tip: "Look at the breakdown, not just the aggregate score. High positive AND high negative means controversy, not calm.",
      },
    ],
  },
  {
    id: "prediction",
    title: "AI Price Prediction",
    description: "Understanding LSTM neural networks and the metrics used to evaluate prediction accuracy.",
    terms: [
      {
        term: "LSTM (Long Short-Term Memory)",
        short: "A type of neural network designed for sequential/time-series data.",
        detail: "LSTM networks are a special kind of recurrent neural network (RNN) that can learn long-term patterns in data. They're widely used for stock price prediction because they can capture temporal dependencies — how today's price relates to prices weeks or months ago. Our model uses stacked LSTM layers trained per-ticker.",
        example: "The LSTM model trains on 1+ year of daily price data to forecast the next 30 days.",
        tip: "LSTM predictions are probabilistic estimates, not guarantees. Always use them alongside fundamental and sentiment analysis.",
      },
      {
        term: "MAPE (Mean Absolute Percentage Error)",
        short: "Average prediction error as a percentage.",
        detail: "MAPE = (1/n) * Sum(|Actual - Predicted| / |Actual|) * 100. A MAPE of 5% means predictions are on average 5% away from actual values. Lower is better. MAPE below 10% is generally considered good for stock prediction.",
        example: "MAPE of 5.5% means on average, predictions are off by about 5.5% from actual prices.",
        tip: "MAPE is relative, so it works across different price scales. A 5% error on a $100 stock = $5; on a $1000 stock = $50.",
      },
      {
        term: "RMSE (Root Mean Square Error)",
        short: "Standard deviation of prediction errors in dollar terms.",
        detail: "RMSE = sqrt(mean((Actual - Predicted)^2)). Unlike MAPE, RMSE is in the same units as the price (dollars). It penalizes large errors more heavily than small ones. Lower RMSE means more precise predictions.",
        example: "RMSE of $12.80 means typical prediction error is around $12.80 from the actual price.",
        tip: "Compare RMSE to the stock's price. RMSE of $12 matters more on a $50 stock than a $500 stock.",
      },
      {
        term: "Confidence Interval",
        short: "Range within which the actual price is expected to fall.",
        detail: "Our model provides upper and lower bounds for each prediction. A 95% confidence interval means there's a 95% probability the actual price will fall within that range. Wider intervals = more uncertainty.",
        example: "Prediction: $155, 95% CI: $148 - $162. The model is fairly confident the price will be in this range.",
        tip: "If the confidence interval is very wide, the model is uncertain. Narrow intervals indicate higher conviction.",
      },
    ],
  },
  {
    id: "market",
    title: "Stock Market Basics",
    description: "Core concepts every investor should understand before putting money to work.",
    terms: [
      {
        term: "IPO (Initial Public Offering)",
        short: "When a private company first sells shares to the public.",
        detail: "An IPO is the process by which a private company becomes publicly traded on a stock exchange. Investment banks underwrite the offering, set an initial price, and allocate shares. After the IPO, shares trade freely on the open market. Companies do IPOs to raise capital for growth.",
        example: "When a tech startup goes public at $25/share and raises $2 billion, that's their IPO.",
        tip: "IPO stocks are volatile in the first months. Many financial advisors suggest waiting 3-6 months before buying to let the price stabilize.",
      },
      {
        term: "Bull Market vs Bear Market",
        short: "Extended periods of rising (bull) or falling (bear) prices.",
        detail: "A bull market is generally defined as a sustained 20%+ rise from recent lows. A bear market is a 20%+ decline from recent highs. Bull markets tend to last longer (average ~5 years) than bear markets (average ~1 year). The terms describe the overall market mood and trend.",
        example: "The 2020-2021 period was a strong bull market; early 2022 saw a bear market in tech stocks.",
        tip: "Bear markets are when wealth is transferred from the impatient to the patient. Long-term investors often buy during bear markets.",
      },
      {
        term: "Index (S&P 500, NASDAQ, Dow Jones)",
        short: "A benchmark that tracks the performance of a group of stocks.",
        detail: "The S&P 500 tracks 500 large US companies (most widely used benchmark). The NASDAQ Composite is tech-heavy. The Dow Jones Industrial Average tracks 30 blue-chip stocks. Index funds let you invest in all stocks within an index at once.",
        example: "'The market was up 2% today' usually refers to the S&P 500 rising 2%.",
        tip: "Over 90% of actively managed funds fail to beat the S&P 500 over 15+ years. Index investing is a proven strategy.",
      },
      {
        term: "Market Order vs Limit Order",
        short: "How you specify the price at which to buy or sell.",
        detail: "A market order executes immediately at the best available price. A limit order only executes at your specified price or better. Market orders guarantee execution but not price. Limit orders guarantee price but not execution.",
        example: "Stock at $100: Market order buys instantly (maybe at $100.05). Limit order at $99 waits until price drops to $99.",
        tip: "Always use limit orders for less liquid stocks. Market orders on low-volume stocks can fill at terrible prices.",
      },
      {
        term: "Dividend",
        short: "Cash payment made by a company to shareholders.",
        detail: "Dividends are typically paid quarterly from company profits. Not all companies pay dividends — growth companies often reinvest instead. The ex-dividend date determines who receives the payment. Dividend aristocrats are companies that have increased dividends for 25+ consecutive years.",
        example: "Apple pays ~$0.96/year per share in dividends. Owning 100 shares = $96/year in dividend income.",
        tip: "Reinvesting dividends (DRIP) compounds returns significantly over time. $10K invested in S&P 500 in 1990 with dividends reinvested = ~$200K+ by 2024.",
      },
      {
        term: "Short Selling",
        short: "Borrowing shares to sell, hoping to buy back cheaper.",
        detail: "Short sellers borrow shares from a broker, sell them immediately, and hope to buy them back at a lower price later. The difference is their profit. Short selling has unlimited risk since a stock can rise indefinitely. A 'short squeeze' happens when short sellers are forced to buy back quickly, driving prices up sharply.",
        example: "You short 100 shares at $50, stock drops to $30, you buy back = $2,000 profit. If it goes to $80 instead = $3,000 loss.",
        tip: "Short selling is extremely risky for beginners. Losses are theoretically unlimited. Most investors should stick to buying (going long).",
      },
      {
        term: "ETF (Exchange-Traded Fund)",
        short: "A basket of securities that trades like a single stock.",
        detail: "ETFs hold collections of stocks, bonds, or other assets. They trade on exchanges like regular stocks but give you instant diversification. SPY tracks the S&P 500, QQQ tracks the NASDAQ 100. ETFs have lower fees than most mutual funds.",
        example: "Buying 1 share of SPY (~$500) gives you exposure to all 500 companies in the S&P 500.",
        tip: "For most people, a diversified portfolio of low-cost ETFs (like SPY + international + bonds) is the best strategy.",
      },
      {
        term: "Market Hours & After-Hours Trading",
        short: "Regular trading: 9:30 AM - 4:00 PM ET. Extended hours exist but with less liquidity.",
        detail: "US stock markets (NYSE, NASDAQ) are open Monday-Friday, 9:30 AM to 4:00 PM Eastern Time. Pre-market trading runs 4:00-9:30 AM, after-hours runs 4:00-8:00 PM. Extended hours have wider spreads and less volume, making prices more volatile.",
        example: "A company reports earnings at 4:05 PM — the stock may move 10% in after-hours before regular trading opens.",
        tip: "Avoid placing market orders in pre-market or after-hours. Use limit orders to protect yourself from wide spreads.",
      },
      {
        term: "Portfolio Diversification",
        short: "Spreading investments across different assets to reduce risk.",
        detail: "Diversification means not putting all your eggs in one basket. By investing across different sectors, geographies, and asset classes (stocks, bonds, real estate), you reduce the impact of any single investment going wrong. Modern Portfolio Theory shows diversification can reduce risk without reducing expected returns.",
        example: "Instead of 100% in tech stocks, a diversified portfolio might be 60% stocks (across sectors), 30% bonds, 10% international.",
        tip: "You need far fewer stocks than you think for diversification. Studies show 15-20 stocks across sectors capture most of the benefit.",
      },
    ],
  },
];

function TermCard({ term: t, isOpen, onToggle }: { term: Term; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{
      background: C.card,
      border: C.border,
      borderRadius: 10,
      overflow: "hidden",
      transition: "box-shadow 0.15s",
      boxShadow: isOpen ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          textAlign: "left",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{t.term}</p>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t.short}</p>
        </div>
        <span style={{
          fontSize: 18,
          color: C.ghost,
          flexShrink: 0,
          transform: isOpen ? "rotate(45deg)" : "none",
          transition: "transform 0.2s",
          lineHeight: 1,
        }}>+</span>
      </button>

      {isOpen && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.bg}` }}>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.75, marginTop: 12 }}>{t.detail}</p>

          {t.example && (
            <div style={{
              marginTop: 12,
              padding: "10px 14px",
              background: C.accent,
              border: C.border,
              borderRadius: 8,
            }}>
              <p style={{ fontSize: 10, color: C.ghost, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, fontWeight: 600 }}>Example</p>
              <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>{t.example}</p>
            </div>
          )}

          {t.tip && (
            <div style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "#f6faf6",
              border: "1px solid #e0ede0",
              borderRadius: 8,
            }}>
              <p style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, fontWeight: 600 }}>Pro Tip</p>
              <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>{t.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Docs() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>("fundamentals");
  const [search, setSearch] = useState("");

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    SECTIONS.forEach((s) => s.terms.forEach((t) => all.add(`${s.id}-${t.term}`)));
    setOpenItems(all);
  };

  const collapseAll = () => setOpenItems(new Set());

  // Filter terms by search
  const filteredSections = search.trim()
    ? SECTIONS.map((s) => ({
        ...s,
        terms: s.terms.filter(
          (t) =>
            t.term.toLowerCase().includes(search.toLowerCase()) ||
            t.short.toLowerCase().includes(search.toLowerCase()) ||
            t.detail.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((s) => s.terms.length > 0)
    : SECTIONS.filter((s) => s.id === activeSection);

  const totalTerms = SECTIONS.reduce((acc, s) => acc + s.terms.length, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: C.card, borderBottom: C.border,
        height: 50, display: "flex", alignItems: "center",
        padding: "0 20px", gap: 14,
      }}>
        <Link to="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none",
        }}>
          <div style={{
            width: 28, height: 28, background: "#111", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="1,11 4,7 7,8.5 13,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>StockAI</span>
        </Link>

        <div style={{ width: "1px", height: 18, background: "#e8e8e8" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>Learn</span>

        <div style={{ flex: 1 }} />
        <Link to="/" style={{
          fontSize: 12, color: C.muted, textDecoration: "none",
          padding: "5px 12px", borderRadius: 6,
          border: C.border, background: C.bg,
        }}>
          Back to Dashboard
        </Link>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: 800, margin: "0 auto",
        padding: "48px 24px 32px",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Stock Market Guide
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 24px" }}>
          {totalTerms} terms and concepts explained — from fundamental metrics to AI-powered analysis. Everything you need to make informed investment decisions.
        </p>

        {/* Search */}
        <div style={{
          maxWidth: 440, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 10,
          background: C.card, border: C.border, borderRadius: 10,
          padding: "0 14px", height: 44,
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#aaa" strokeWidth="1.5" />
            <path d="M11 11L14.5 14.5" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 13, color: C.text, background: "transparent",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ border: "none", background: "none", cursor: "pointer", color: C.ghost, fontSize: 16, padding: 0 }}
            >
              x
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Section tabs (hidden during search) */}
        {!search.trim() && (
          <div style={{
            display: "flex", gap: 4, marginBottom: 20,
            overflowX: "auto",
            paddingBottom: 4,
          }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  background: activeSection === s.id ? C.text : C.card,
                  color: activeSection === s.id ? "#fff" : C.muted,
                  transition: "all 0.15s",
                  ...(activeSection !== s.id ? { border: C.border } : {}),
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
          <button onClick={expandAll} style={{
            fontSize: 11, color: C.muted, background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", padding: "2px 0",
          }}>
            Expand all
          </button>
          <span style={{ color: "#e8e8e8" }}>|</span>
          <button onClick={collapseAll} style={{
            fontSize: 11, color: C.muted, background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", padding: "2px 0",
          }}>
            Collapse all
          </button>
        </div>

        {/* Content */}
        {filteredSections.map((section) => (
          <div key={section.id} style={{ marginBottom: 32 }}>
            {search.trim() && (
              <p style={{
                fontSize: 11, fontWeight: 600, color: C.ghost,
                textTransform: "uppercase", letterSpacing: "0.6px",
                marginBottom: 10,
              }}>
                {section.title}
              </p>
            )}
            {!search.trim() && (
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                {section.description}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {section.terms.map((t) => (
                <TermCard
                  key={t.term}
                  term={t}
                  isOpen={openItems.has(`${section.id}-${t.term}`)}
                  onToggle={() => toggle(`${section.id}-${t.term}`)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && search.trim() && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 14, color: C.muted }}>No terms matching "{search}"</p>
            <button
              onClick={() => setSearch("")}
              style={{
                marginTop: 12, fontSize: 12, color: C.muted,
                background: C.card, border: C.border, borderRadius: 8,
                padding: "7px 16px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
