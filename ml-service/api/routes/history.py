from fastapi import APIRouter, HTTPException, Query
from services.yfinance_service import fetch_ohlcv
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/{ticker}")
async def get_history(
    ticker: str,
    range: str = Query(default="1y", regex="^(1m|3m|6m|1y|2y|5y)$"),
):
    ticker = ticker.upper()
    cache_key = f"history:{ticker}:{range}"

    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        df = fetch_ohlcv(ticker, period=range)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {e}")

    bars = [
        {
            "date": idx.strftime("%Y-%m-%d"),
            "open":   round(float(row["Open"]),   4),
            "high":   round(float(row["High"]),   4),
            "low":    round(float(row["Low"]),    4),
            "close":  round(float(row["Close"]),  4),
            "volume": int(row["Volume"]),
        }
        for idx, row in df.iterrows()
    ]

    result = {"ticker": ticker, "range": range, "bars": bars}
    await cache_set(cache_key, result, settings.cache_indicators_ttl)
    return result
