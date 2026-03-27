import yfinance as yf
import pandas as pd


def fetch_ohlcv(ticker: str, period: str = "2y") -> pd.DataFrame:
    """Fetch OHLCV data using yfinance. Returns DataFrame with Date index."""
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'")
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
    df.dropna(inplace=True)
    return df


def fetch_company_info(ticker: str) -> dict:
    stock = yf.Ticker(ticker)
    info = stock.info
    return {
        "name": info.get("longName", ticker),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
    }
