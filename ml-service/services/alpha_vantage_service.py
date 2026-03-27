"""
Alpha Vantage fetcher — RSI, MACD, moving averages (SMA/EMA), Bollinger Bands.
Used for technical indicators. yfinance handles OHLCV to avoid AV rate limits (25/day free tier).
"""
import httpx
import pandas as pd
from core.config import settings

BASE_URL = "https://www.alphavantage.co/query"


async def _fetch(params: dict) -> dict:
    params["apikey"] = settings.alpha_vantage_api_key
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(BASE_URL, params=params)
        res.raise_for_status()
        data = res.json()

    if "Note" in data:
        raise RuntimeError("Alpha Vantage rate limit reached (25 calls/day on free tier)")
    if "Error Message" in data:
        raise ValueError(data["Error Message"])
    if "Information" in data:
        raise RuntimeError(data["Information"])

    return data


async def get_rsi(ticker: str, period: int = 14, interval: str = "daily") -> pd.Series:
    """Fetch RSI values. Returns Series indexed by date."""
    data = await _fetch({
        "function": "RSI",
        "symbol": ticker,
        "interval": interval,
        "time_period": period,
        "series_type": "close",
    })
    series = data.get("Technical Analysis: RSI", {})
    if not series:
        raise ValueError(f"No RSI data for {ticker}")
    df = pd.DataFrame.from_dict(series, orient="index", dtype=float)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    return df["RSI"]


async def get_macd(ticker: str, interval: str = "daily") -> pd.DataFrame:
    """Fetch MACD (12/26/9). Returns DataFrame with macd, signal, hist columns."""
    data = await _fetch({
        "function": "MACD",
        "symbol": ticker,
        "interval": interval,
        "series_type": "close",
        "fastperiod": 12,
        "slowperiod": 26,
        "signalperiod": 9,
    })
    series = data.get("Technical Analysis: MACD", {})
    if not series:
        raise ValueError(f"No MACD data for {ticker}")
    df = pd.DataFrame.from_dict(series, orient="index", dtype=float)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    df.columns = ["macd", "signal", "hist"]
    return df


async def get_sma(ticker: str, period: int, interval: str = "daily") -> pd.Series:
    """Simple Moving Average."""
    data = await _fetch({
        "function": "SMA",
        "symbol": ticker,
        "interval": interval,
        "time_period": period,
        "series_type": "close",
    })
    key = "Technical Analysis: SMA"
    series = data.get(key, {})
    if not series:
        raise ValueError(f"No SMA({period}) data for {ticker}")
    df = pd.DataFrame.from_dict(series, orient="index", dtype=float)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    return df["SMA"]


async def get_ema(ticker: str, period: int, interval: str = "daily") -> pd.Series:
    """Exponential Moving Average."""
    data = await _fetch({
        "function": "EMA",
        "symbol": ticker,
        "interval": interval,
        "time_period": period,
        "series_type": "close",
    })
    series = data.get("Technical Analysis: EMA", {})
    if not series:
        raise ValueError(f"No EMA({period}) data for {ticker}")
    df = pd.DataFrame.from_dict(series, orient="index", dtype=float)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    return df["EMA"]


async def get_bbands(ticker: str, period: int = 20, interval: str = "daily") -> pd.DataFrame:
    """Bollinger Bands. Returns DataFrame with upper, middle, lower."""
    data = await _fetch({
        "function": "BBANDS",
        "symbol": ticker,
        "interval": interval,
        "time_period": period,
        "series_type": "close",
        "nbdevup": 2,
        "nbdevdn": 2,
    })
    series = data.get("Technical Analysis: BBANDS", {})
    if not series:
        raise ValueError(f"No Bollinger Bands data for {ticker}")
    df = pd.DataFrame.from_dict(series, orient="index", dtype=float)
    df.index = pd.to_datetime(df.index)
    df.sort_index(inplace=True)
    df.columns = ["upper", "middle", "lower"]
    return df


async def get_all_indicators(ticker: str) -> dict:
    """
    Fetch RSI, MACD, SMA(20/50/200), EMA(12/26), BBands in as few calls as possible.
    On free tier (25 calls/day), we fetch RSI + MACD + SMA20 + SMA50 + BBands = 5 calls.
    SMA200 and EMA are computed locally from OHLCV to save API calls.
    """
    import asyncio

    results = await asyncio.gather(
        get_rsi(ticker),
        get_macd(ticker),
        get_sma(ticker, 20),
        get_sma(ticker, 50),
        get_bbands(ticker, 20),
        return_exceptions=True,
    )

    rsi, macd, sma20, sma50, bbands = results

    # Get the most recent date across all indicators
    latest = {}

    def _latest(series, name):
        if isinstance(series, Exception) or series is None:
            return
        try:
            if isinstance(series, pd.Series):
                latest[name] = float(series.iloc[-1])
            elif isinstance(series, pd.DataFrame):
                row = series.iloc[-1]
                for col in row.index:
                    latest[f"{name}_{col}"] = float(row[col])
        except Exception:
            pass

    _latest(rsi, "rsi14")
    _latest(macd, "macd")
    _latest(sma20, "sma20")
    _latest(sma50, "sma50")
    _latest(bbands, "bb")

    # Build time-series (last 100 rows) for chart display
    def _to_list(series, cols=None):
        if isinstance(series, Exception) or series is None:
            return []
        try:
            df = series.tail(100) if isinstance(series, pd.Series) else series.tail(100)
            if isinstance(df, pd.Series):
                return [{"date": str(d.date()), "value": round(float(v), 4)}
                        for d, v in df.items() if not pd.isna(v)]
            else:
                records = []
                for d, row in df.iterrows():
                    record = {"date": str(d.date())}
                    for col in row.index:
                        record[col] = round(float(row[col]), 4) if not pd.isna(row[col]) else None
                    records.append(record)
                return records
        except Exception:
            return []

    return {
        "ticker": ticker.upper(),
        "latest": latest,
        "series": {
            "rsi": _to_list(rsi),
            "macd": _to_list(macd),
            "sma20": _to_list(sma20),
            "sma50": _to_list(sma50),
            "bbands": _to_list(bbands),
        },
    }
