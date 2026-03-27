import type { DemoSnapshot } from "./types";
import { generateHistory, generatePredictions } from "./generate";

// ─── AAPL ─────────────────────────────────────────────────────────────────────
const aaplHistory = generateHistory("AAPL", 175, 365, 0.014, 0.0003);
const aaplLast = aaplHistory[aaplHistory.length - 1].close;
const aaplPrev = aaplHistory[aaplHistory.length - 2].close;

export const AAPL: DemoSnapshot = {
  quote: {
    ticker: "AAPL",
    price: aaplLast,
    open: aaplHistory[aaplHistory.length - 1].open,
    high: aaplHistory[aaplHistory.length - 1].high,
    low: aaplHistory[aaplHistory.length - 1].low,
    volume: aaplHistory[aaplHistory.length - 1].volume,
    latestTradingDay: aaplHistory[aaplHistory.length - 1].date,
    previousClose: aaplPrev,
    change: Math.round((aaplLast - aaplPrev) * 100) / 100,
    changePercent: `${(((aaplLast - aaplPrev) / aaplPrev) * 100).toFixed(2)}%`,
  },
  fundamentals: {
    ticker: "AAPL",
    name: "Apple Inc.",
    description:
      "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and Wearables, Home and Accessories product lines, as well as various related services.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    marketCap: 3_651_000_000_000,
    peRatio: 31.49,
    forwardPE: 28.12,
    eps: 7.89,
    dividendYield: 0.0044,
    beta: 1.24,
    week52High: 260.1,
    week52Low: 164.08,
    returnOnEquity: 1.6065,
    profitMargin: 0.2644,
    priceToBook: 48.63,
    analystTargetPrice: 247.5,
  },
  history: aaplHistory,
  prediction: {
    ticker: "AAPL",
    predictions: generatePredictions("AAPL", aaplLast, 16.23, 30),
    mape: 5.52,
    rmse: 16.23,
    mae: 14.19,
    confidence: 94.48,
    trainedOn: 341,
  },
  sentiment: {
    ticker: "AAPL",
    score: 0.2267,
    label: "Bullish",
    breakdown: { positive: 0.529, negative: 0.303, neutral: 0.168 },
    articlesAnalyzed: 20,
    topBullish: [
      { title: "Apple beats Q4 earnings estimates, EPS exceeds guidance by 8%", sentimentScore: 0.92, sentimentLabel: "Bullish" },
      { title: "Apple announces record $110B share buyback program", sentimentScore: 0.88, sentimentLabel: "Bullish" },
      { title: "Apple Vision Pro gains significant traction in enterprise market", sentimentScore: 0.84, sentimentLabel: "Bullish" },
    ],
    topBearish: [
      { title: "iPhone sales disappoint in China amid rising tariff headwinds", sentimentScore: -0.96, sentimentLabel: "Bearish" },
      { title: "Apple faces antitrust scrutiny in EU over App Store practices", sentimentScore: -0.94, sentimentLabel: "Bearish" },
    ],
  },
  news: [
    { title: "Apple beats Q4 earnings, EPS exceeds guidance by 8%", description: "Apple reported better-than-expected quarterly results driven by strong Services revenue growth.", url: "#", source: "Reuters", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.92, sentimentLabel: "Bullish" },
    { title: "Apple announces record $110B share buyback program", description: "The company unveiled its largest-ever buyback program alongside a dividend increase.", url: "#", source: "Bloomberg", publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.88, sentimentLabel: "Bullish" },
    { title: "iPhone sales disappoint in China amid tariff headwinds", description: "Analysts cut price targets following weaker-than-expected China revenue figures.", url: "#", source: "CNBC", publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.96, sentimentLabel: "Bearish" },
    { title: "Apple Vision Pro gains traction in enterprise market", description: "Enterprise adoption of Vision Pro is accelerating faster than initial projections.", url: "#", source: "WSJ", publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.84, sentimentLabel: "Bullish" },
    { title: "Apple faces antitrust scrutiny in EU over App Store practices", description: "European regulators announced a formal investigation into Apple's App Store policies.", url: "#", source: "FT", publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.94, sentimentLabel: "Bearish" },
    { title: "Apple AI features drive upgrade supercycle anticipation", description: "Wall Street analysts predict a major upgrade cycle driven by on-device AI capabilities.", url: "#", source: "Barron's", publishedAt: new Date(Date.now() - 24 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.79, sentimentLabel: "Bullish" },
    { title: "AAPL shares in-line with broader tech sector performance", description: "Apple shares tracked the Nasdaq index closely with no significant divergence.", url: "#", source: "MarketWatch", publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.05, sentimentLabel: "Neutral" },
    { title: "Apple supply chain diversification to India progressing on schedule", description: "Manufacturing shift to India is tracking ahead of initial timelines per supply chain sources.", url: "#", source: "Reuters", publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.61, sentimentLabel: "Bullish" },
  ],
};

// ─── TSLA ─────────────────────────────────────────────────────────────────────
const tslaHistory = generateHistory("TSLA", 210, 365, 0.028, 0.0001);
const tslaLast = tslaHistory[tslaHistory.length - 1].close;
const tslaPrev = tslaHistory[tslaHistory.length - 2].close;

export const TSLA: DemoSnapshot = {
  quote: {
    ticker: "TSLA",
    price: tslaLast,
    open: tslaHistory[tslaHistory.length - 1].open,
    high: tslaHistory[tslaHistory.length - 1].high,
    low: tslaHistory[tslaHistory.length - 1].low,
    volume: tslaHistory[tslaHistory.length - 1].volume,
    latestTradingDay: tslaHistory[tslaHistory.length - 1].date,
    previousClose: tslaPrev,
    change: Math.round((tslaLast - tslaPrev) * 100) / 100,
    changePercent: `${(((tslaLast - tslaPrev) / tslaPrev) * 100).toFixed(2)}%`,
  },
  fundamentals: {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    description:
      "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, energy generation and storage systems, and related services in the United States, China, and internationally.",
    exchange: "NASDAQ",
    sector: "Consumer Cyclical",
    industry: "Auto Manufacturers",
    marketCap: 1_350_000_000_000,
    peRatio: 333.28,
    forwardPE: 89.4,
    eps: 1.08,
    dividendYield: 0,
    beta: 2.34,
    week52High: 488.54,
    week52Low: 138.8,
    returnOnEquity: 0.1053,
    profitMargin: 0.0769,
    priceToBook: 14.21,
    analystTargetPrice: 295.0,
  },
  history: tslaHistory,
  prediction: {
    ticker: "TSLA",
    predictions: generatePredictions("TSLA", tslaLast, 28.4, 30),
    mape: 7.8,
    rmse: 28.4,
    mae: 22.1,
    confidence: 92.2,
    trainedOn: 341,
  },
  sentiment: {
    ticker: "TSLA",
    score: -0.142,
    label: "Bearish",
    breakdown: { positive: 0.28, negative: 0.422, neutral: 0.298 },
    articlesAnalyzed: 20,
    topBullish: [
      { title: "Tesla Cybertruck deliveries accelerate ahead of production targets", sentimentScore: 0.87, sentimentLabel: "Bullish" },
      { title: "Tesla FSD miles driven hits record high in Q1 2026", sentimentScore: 0.81, sentimentLabel: "Bullish" },
    ],
    topBearish: [
      { title: "Tesla Q1 deliveries miss consensus estimates by 15%", sentimentScore: -0.97, sentimentLabel: "Bearish" },
      { title: "Elon Musk DOGE role weighs on Tesla brand sentiment globally", sentimentScore: -0.91, sentimentLabel: "Bearish" },
      { title: "Tesla faces margin compression from EV price war with BYD", sentimentScore: -0.88, sentimentLabel: "Bearish" },
    ],
  },
  news: [
    { title: "Tesla Q1 deliveries miss consensus estimates by 15%", description: "The EV maker delivered 336,681 vehicles, falling short of the 370,000 analyst consensus.", url: "#", source: "Reuters", publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.97, sentimentLabel: "Bearish" },
    { title: "Elon Musk DOGE role weighs on Tesla brand globally", description: "Brand sentiment surveys show declining consumer favorability in key markets.", url: "#", source: "Bloomberg", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.91, sentimentLabel: "Bearish" },
    { title: "Tesla Cybertruck deliveries accelerate ahead of targets", description: "Production ramp at Gigafactory Texas exceeds management guidance for Q2.", url: "#", source: "CNBC", publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.87, sentimentLabel: "Bullish" },
    { title: "Tesla faces margin compression from EV price war with BYD", description: "Multiple price cuts across Model 3 and Model Y lines pressure gross margins.", url: "#", source: "WSJ", publishedAt: new Date(Date.now() - 15 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.88, sentimentLabel: "Bearish" },
    { title: "Tesla FSD miles driven hits record high in Q1 2026", description: "Cumulative FSD miles surpass 3 billion, supporting robotaxi timeline thesis.", url: "#", source: "Seeking Alpha", publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.81, sentimentLabel: "Bullish" },
    { title: "TSLA institutional holders reduce positions ahead of delivery print", description: "13F filings show three major funds trimmed TSLA positions in Q4.", url: "#", source: "MarketWatch", publishedAt: new Date(Date.now() - 28 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.72, sentimentLabel: "Bearish" },
  ],
};

// ─── MSFT ─────────────────────────────────────────────────────────────────────
const msftHistory = generateHistory("MSFT", 380, 365, 0.011, 0.0004);
const msftLast = msftHistory[msftHistory.length - 1].close;
const msftPrev = msftHistory[msftHistory.length - 2].close;

export const MSFT: DemoSnapshot = {
  quote: {
    ticker: "MSFT",
    price: msftLast,
    open: msftHistory[msftHistory.length - 1].open,
    high: msftHistory[msftHistory.length - 1].high,
    low: msftHistory[msftHistory.length - 1].low,
    volume: msftHistory[msftHistory.length - 1].volume,
    latestTradingDay: msftHistory[msftHistory.length - 1].date,
    previousClose: msftPrev,
    change: Math.round((msftLast - msftPrev) * 100) / 100,
    changePercent: `${(((msftLast - msftPrev) / msftPrev) * 100).toFixed(2)}%`,
  },
  fundamentals: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    description:
      "Microsoft Corporation develops and supports software, services, devices and solutions worldwide. The Productivity and Business Processes segment offers Office, Exchange, SharePoint, Skype, and related services, as well as LinkedIn and Dynamics business solutions.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software—Infrastructure",
    marketCap: 2_653_000_000_000,
    peRatio: 22.33,
    forwardPE: 29.8,
    eps: 15.99,
    dividendYield: 0.0075,
    beta: 0.9,
    week52High: 468.35,
    week52Low: 344.79,
    returnOnEquity: 0.3592,
    profitMargin: 0.358,
    priceToBook: 11.42,
    analystTargetPrice: 490.0,
  },
  history: msftHistory,
  prediction: {
    ticker: "MSFT",
    predictions: generatePredictions("MSFT", msftLast, 12.8, 30),
    mape: 3.4,
    rmse: 12.8,
    mae: 10.2,
    confidence: 96.6,
    trainedOn: 341,
  },
  sentiment: {
    ticker: "MSFT",
    score: 0.489,
    label: "Bullish",
    breakdown: { positive: 0.661, negative: 0.172, neutral: 0.167 },
    articlesAnalyzed: 20,
    topBullish: [
      { title: "Microsoft Azure revenue grows 33% YoY driven by AI demand", sentimentScore: 0.96, sentimentLabel: "Bullish" },
      { title: "Microsoft Copilot enterprise seats surpass 1 million milestone", sentimentScore: 0.92, sentimentLabel: "Bullish" },
      { title: "Microsoft raises dividend 10% on strong cloud momentum", sentimentScore: 0.89, sentimentLabel: "Bullish" },
    ],
    topBearish: [
      { title: "Microsoft faces regulatory scrutiny over Activision integration", sentimentScore: -0.78, sentimentLabel: "Bearish" },
    ],
  },
  news: [
    { title: "Microsoft Azure revenue grows 33% YoY driven by AI demand", description: "Azure cloud division continues to outperform expectations as enterprises accelerate AI adoption.", url: "#", source: "Bloomberg", publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.96, sentimentLabel: "Bullish" },
    { title: "Microsoft Copilot enterprise seats surpass 1 million milestone", description: "AI assistant adoption in the enterprise segment has reached a significant milestone.", url: "#", source: "Reuters", publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.92, sentimentLabel: "Bullish" },
    { title: "Microsoft raises dividend 10% on strong cloud momentum", description: "Board approves higher payout ratio reflecting confidence in sustained revenue growth.", url: "#", source: "WSJ", publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.89, sentimentLabel: "Bullish" },
    { title: "Microsoft faces regulatory scrutiny over Activision integration", description: "Competition regulators in multiple jurisdictions are reviewing gaming market concentration.", url: "#", source: "FT", publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), urlToImage: null, sentimentScore: -0.78, sentimentLabel: "Bearish" },
    { title: "Microsoft Teams usage accelerates with AI meeting summary features", description: "Daily active users of Teams hit new highs as AI-powered features drive engagement.", url: "#", source: "CNBC", publishedAt: new Date(Date.now() - 16 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.82, sentimentLabel: "Bullish" },
    { title: "MSFT maintains buy rating across 38 of 42 covering analysts", description: "Analyst consensus remains strongly positive ahead of the next earnings print.", url: "#", source: "Barron's", publishedAt: new Date(Date.now() - 22 * 3600000).toISOString(), urlToImage: null, sentimentScore: 0.75, sentimentLabel: "Bullish" },
  ],
};

export const DEMO_DATA: Record<string, DemoSnapshot> = { AAPL, TSLA, MSFT };
export const DEMO_TICKERS = Object.keys(DEMO_DATA) as (keyof typeof DEMO_DATA)[];
