import asyncio
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from services.alpha_vantage_service import get_all_indicators, get_rsi, get_macd, get_sma, get_ema, get_bbands
from services.yfinance_service import fetch_ohlcv
from core.cache import cache_get, cache_set
from core.config import settings
import pandas as pd
import numpy as np

router = APIRouter(prefix="/indicators", tags=["indicators"])


def _compute_local_indicators(ticker: str) -> dict:
    """
    Compute RSI, MACD, SMA, EMA, Bollinger Bands locally from yfinance OHLCV.
    Used as fallback/supplement to Alpha Vantage to save API calls.
    """
    df = fetch_ohlcv(ticker, period="1y")
    close = df["Close"]

    # RSI(14)
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))

    # EMA(12), EMA(26)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()

    # MACD
    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    hist = macd - signal

    # SMA(20), SMA(50), SMA(200)
    sma20 = close.rolling(20).mean()
    sma50 = close.rolling(50).mean()
    sma200 = close.rolling(200).mean()

    # Bollinger Bands (20, 2σ)
    bb_mid = sma20
    bb_std = close.rolling(20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std

    def _series_to_list(s: pd.Series, name: str):
        return [
            {"date": str(idx.date()), "value": round(float(v), 4)}
            for idx, v in s.tail(100).items()
            if not pd.isna(v)
        ]

    latest_idx = close.index[-1]

    def _latest(s: pd.Series):
        v = s.dropna().iloc[-1] if not s.dropna().empty else None
        return round(float(v), 4) if v is not None else None

    macd_series = [
        {"date": str(idx.date()), "macd": round(float(m), 4), "signal": round(float(sg), 4), "hist": round(float(h), 4)}
        for idx, m, sg, h in zip(macd.index[-100:], macd.iloc[-100:], signal.iloc[-100:], hist.iloc[-100:])
        if not (pd.isna(m) or pd.isna(sg) or pd.isna(h))
    ]

    bb_series = [
        {"date": str(idx.date()), "upper": round(float(u), 4), "middle": round(float(mid), 4), "lower": round(float(lo), 4)}
        for idx, u, mid, lo in zip(bb_upper.index[-100:], bb_upper.iloc[-100:], bb_mid.iloc[-100:], bb_lower.iloc[-100:])
        if not (pd.isna(u) or pd.isna(mid) or pd.isna(lo))
    ]

    return {
        "ticker": ticker,
        "latest": {
            "rsi14": _latest(rsi),
            "macd_macd": _latest(macd),
            "macd_signal": _latest(signal),
            "macd_hist": _latest(hist),
            "sma20": _latest(sma20),
            "sma50": _latest(sma50),
            "sma200": _latest(sma200),
            "ema12": _latest(ema12),
            "ema26": _latest(ema26),
            "bb_upper": _latest(bb_upper),
            "bb_middle": _latest(bb_mid),
            "bb_lower": _latest(bb_lower),
        },
        "series": {
            "rsi": _series_to_list(rsi, "rsi"),
            "macd": macd_series,
            "sma20": _series_to_list(sma20, "sma20"),
            "sma50": _series_to_list(sma50, "sma50"),
            "sma200": _series_to_list(sma200, "sma200"),
            "ema12": _series_to_list(ema12, "ema12"),
            "ema26": _series_to_list(ema26, "ema26"),
            "bbands": bb_series,
        },
        "source": "yfinance_computed",
    }


@router.get("/{ticker}")
async def get_indicators(
    ticker: str,
    source: str = Query(default="local", description="'local' (yfinance computed, free) or 'alphavantage' (API, 25/day limit)")
):
    """
    Technical indicators: RSI(14), MACD(12/26/9), SMA(20/50/200), EMA(12/26), Bollinger Bands.

    source=local: computed from yfinance OHLCV — unlimited, always available.
    source=alphavantage: fetched from Alpha Vantage API — accurate but limited to 25 calls/day on free tier.
    """
    ticker = ticker.upper()
    cache_key = f"indicators:{ticker}:{source}"

    cached = await cache_get(cache_key)
    if cached:
        return {**cached, "cached": True}

    try:
        if source == "alphavantage":
            data = await get_all_indicators(ticker)
            data["source"] = "alphavantage"
        else:
            # Default: compute locally from yfinance — saves precious AV API calls
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, _compute_local_indicators, ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        # AV rate limit hit — fall back to local computation
        if "rate limit" in str(e).lower() or "limit" in str(e).lower():
            try:
                loop = asyncio.get_event_loop()
                data = await loop.run_in_executor(None, _compute_local_indicators, ticker)
                data["warning"] = "Alpha Vantage rate limit reached; fell back to local computation"
            except Exception as e2:
                raise HTTPException(status_code=500, detail=str(e2))
        else:
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indicator fetch failed: {str(e)}")

    await cache_set(cache_key, data, settings.cache_indicators_ttl)
    return data
