import axios from "axios";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const BASE_URL = "https://www.alphavantage.co/query";
const client = axios.create({ baseURL: BASE_URL, timeout: 10000 });

async function fetch(params: Record<string, string>) {
  const res = await client.get("", {
    params: { ...params, apikey: env.ALPHA_VANTAGE_API_KEY },
  });

  if (res.data["Note"]) throw ApiError.tooManyRequests("Alpha Vantage rate limit reached");
  if (res.data["Error Message"]) throw ApiError.badRequest(res.data["Error Message"]);

  return res.data;
}

export async function searchSymbol(query: string) {
  const data = await fetch({ function: "SYMBOL_SEARCH", keywords: query });
  return (data.bestMatches ?? []).map((m: Record<string, string>) => ({
    ticker: m["1. symbol"],
    name: m["2. name"],
    type: m["3. type"],
    region: m["4. region"],
    currency: m["8. currency"],
  }));
}

export async function getQuote(ticker: string) {
  const data = await fetch({ function: "GLOBAL_QUOTE", symbol: ticker });
  const q = data["Global Quote"];
  if (!q || !q["01. symbol"]) throw ApiError.notFound(`Ticker '${ticker}' not found`);

  return {
    ticker: q["01. symbol"],
    price: parseFloat(q["05. price"]),
    open: parseFloat(q["02. open"]),
    high: parseFloat(q["03. high"]),
    low: parseFloat(q["04. low"]),
    volume: parseInt(q["06. volume"]),
    latestTradingDay: q["07. latest trading day"],
    previousClose: parseFloat(q["08. previous close"]),
    change: parseFloat(q["09. change"]),
    changePercent: q["10. change percent"],
  };
}

export async function getFundamentals(ticker: string) {
  const data = await fetch({ function: "OVERVIEW", symbol: ticker });
  if (!data.Symbol) throw ApiError.notFound(`Ticker '${ticker}' not found`);

  return {
    ticker: data.Symbol,
    name: data.Name,
    description: data.Description,
    exchange: data.Exchange,
    currency: data.Currency,
    country: data.Country,
    sector: data.Sector,
    industry: data.Industry,
    marketCap: data.MarketCapitalization,
    peRatio: data.PERatio,
    pegRatio: data.PEGRatio,
    bookValue: data.BookValue,
    dividendYield: data.DividendYield,
    eps: data.EPS,
    revenuePerShare: data.RevenuePerShareTTM,
    profitMargin: data.ProfitMargin,
    operatingMargin: data.OperatingMarginTTM,
    returnOnEquity: data.ReturnOnEquityTTM,
    returnOnAssets: data.ReturnOnAssetsTTM,
    revenueTTM: data.RevenueTTM,
    grossProfitTTM: data.GrossProfitTTM,
    dilutedEPSTTM: data.DilutedEPSTTM,
    quarterlyEarningsGrowth: data.QuarterlyEarningsGrowthYOY,
    quarterlyRevenueGrowth: data.QuarterlyRevenueGrowthYOY,
    analystTargetPrice: data.AnalystTargetPrice,
    week52High: data["52WeekHigh"],
    week52Low: data["52WeekLow"],
    beta: data.Beta,
    sharesOutstanding: data.SharesOutstanding,
    forwardPE: data.ForwardPE,
    priceToBook: data.PriceToBookRatio,
    evToRevenue: data.EVToRevenue,
    evToEBITDA: data.EVToEBITDA,
  };
}

export async function getDailyHistory(ticker: string) {
  const data = await fetch({
    function: "TIME_SERIES_DAILY",
    symbol: ticker,
    outputsize: "full",
  });

  const series = data["Time Series (Daily)"];
  if (!series) throw ApiError.notFound(`No history for ticker '${ticker}'`);

  return Object.entries(series).map(([date, values]: [string, unknown]) => {
    const v = values as Record<string, string>;
    return {
      date,
      open: parseFloat(v["1. open"]),
      high: parseFloat(v["2. high"]),
      low: parseFloat(v["3. low"]),
      close: parseFloat(v["4. close"]),
      volume: parseInt(v["5. volume"]),
    };
  });
}
