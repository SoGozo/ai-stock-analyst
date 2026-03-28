"""
yfinance data fetcher — OHLCV + fundamentals (P/E, EPS, market cap).
Used as primary data source: free, no rate limits, covers 20+ years of history.

In-memory TTL cache avoids redundant yfinance calls within the same time window.
"""
import time
import yfinance as yf
import pandas as pd
from typing import Optional


_PERIOD_MAP = {"2y": "2y", "1y": "1y", "6m": "6mo", "3m": "3mo", "1m": "1mo", "5y": "5y", "max": "max"}

# ── In-memory cache ─────────────────────────────────────────────────────────
_ohlcv_cache: dict[str, tuple[float, pd.DataFrame]] = {}   # key → (expiry, df)
_info_cache: dict[str, tuple[float, dict]] = {}             # ticker → (expiry, info)
_OHLCV_TTL = 300   # 5 minutes
_INFO_TTL  = 600   # 10 minutes


def _get_ticker_info(ticker: str) -> dict:
    """Fetch and cache yf.Ticker.info (shared by fundamentals & company_info)."""
    ticker = ticker.upper()
    now = time.time()
    cached = _info_cache.get(ticker)
    if cached and cached[0] > now:
        return cached[1]
    info = yf.Ticker(ticker).info
    _info_cache[ticker] = (now + _INFO_TTL, info)
    return info


def fetch_ohlcv(ticker: str, period: str = "2y") -> pd.DataFrame:
    """
    Fetch OHLCV daily bars.
    Returns DataFrame indexed by Date with columns: Open, High, Low, Close, Volume.
    """
    ticker = ticker.upper()
    yf_period = _PERIOD_MAP.get(period, period)
    cache_key = f"{ticker}:{yf_period}"
    now = time.time()

    cached = _ohlcv_cache.get(cache_key)
    if cached and cached[0] > now:
        return cached[1].copy()

    stock = yf.Ticker(ticker)
    df = stock.history(period=yf_period, auto_adjust=True)
    if df.empty:
        raise ValueError(f"No price data found for ticker '{ticker}'")
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.index = pd.to_datetime(df.index).tz_localize(None).normalize()
    df.dropna(inplace=True)

    _ohlcv_cache[cache_key] = (now + _OHLCV_TTL, df)
    return df.copy()


def fetch_fundamentals(ticker: str) -> dict:
    """
    Fetch fundamental data: P/E, EPS, market cap, dividend yield, etc.
    Falls back to None for missing fields — never raises on missing data.
    """
    info = _get_ticker_info(ticker)

    def safe(key: str, default=None):
        val = info.get(key, default)
        return val if val not in (None, "N/A", "None", "") else default

    return {
        "ticker": ticker.upper(),
        "name": safe("longName") or safe("shortName", ticker.upper()),
        "exchange": safe("exchange"),
        "sector": safe("sector"),
        "industry": safe("industry"),
        "currency": safe("currency", "USD"),
        "country": safe("country"),
        "description": safe("longBusinessSummary"),
        "marketCap": safe("marketCap"),
        "peRatio": safe("trailingPE"),
        "forwardPE": safe("forwardPE"),
        "eps": safe("trailingEps"),
        "dividendYield": safe("dividendYield"),
        "beta": safe("beta"),
        "week52High": safe("fiftyTwoWeekHigh"),
        "week52Low": safe("fiftyTwoWeekLow"),
        "returnOnEquity": safe("returnOnEquity"),
        "profitMargin": safe("profitMargins"),
        "operatingMargin": safe("operatingMargins"),
        "revenueGrowth": safe("revenueGrowth"),
        "earningsGrowth": safe("earningsGrowth"),
        "priceToBook": safe("priceToBook"),
        "evToRevenue": safe("enterpriseToRevenue"),
        "evToEbitda": safe("enterpriseToEbitda"),
        "sharesOutstanding": safe("sharesOutstanding"),
        "analystTargetPrice": safe("targetMeanPrice"),
        "recommendationKey": safe("recommendationKey"),
        "numberOfAnalysts": safe("numberOfAnalystOpinions"),
        "currentPrice": safe("currentPrice") or safe("regularMarketPrice"),
        "previousClose": safe("previousClose"),
        "open": safe("open"),
        "dayHigh": safe("dayHigh"),
        "dayLow": safe("dayLow"),
        "volume": safe("volume"),
        "averageVolume": safe("averageVolume"),
    }


def fetch_company_info(ticker: str) -> dict:
    """Lightweight — just name, sector, industry for stock registry."""
    info = _get_ticker_info(ticker)
    return {
        "name": info.get("longName") or info.get("shortName", ticker),
        "exchange": info.get("exchange"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "currency": info.get("currency", "USD"),
        "country": info.get("country"),
    }
