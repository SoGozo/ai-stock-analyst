"""
yfinance data fetcher — OHLCV + fundamentals (P/E, EPS, market cap).
Used as primary data source: free, no rate limits, covers 20+ years of history.
"""
import yfinance as yf
import pandas as pd
from typing import Optional


_PERIOD_MAP = {"2y": "2y", "1y": "1y", "6m": "6mo", "3m": "3mo", "1m": "1mo", "5y": "5y", "max": "max"}

def fetch_ohlcv(ticker: str, period: str = "2y") -> pd.DataFrame:
    """
    Fetch OHLCV daily bars.
    Returns DataFrame indexed by Date with columns: Open, High, Low, Close, Volume.
    """
    yf_period = _PERIOD_MAP.get(period, period)  # normalise short codes
    stock = yf.Ticker(ticker)
    df = stock.history(period=yf_period, auto_adjust=True)
    if df.empty:
        raise ValueError(f"No price data found for ticker '{ticker}'")
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.index = pd.to_datetime(df.index).tz_localize(None).normalize()
    df.dropna(inplace=True)
    return df


def fetch_fundamentals(ticker: str) -> dict:
    """
    Fetch fundamental data: P/E, EPS, market cap, dividend yield, etc.
    Falls back to None for missing fields — never raises on missing data.
    """
    stock = yf.Ticker(ticker)
    info = stock.info

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
    stock = yf.Ticker(ticker)
    info = stock.info
    return {
        "name": info.get("longName") or info.get("shortName", ticker),
        "exchange": info.get("exchange"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "currency": info.get("currency", "USD"),
        "country": info.get("country"),
    }
