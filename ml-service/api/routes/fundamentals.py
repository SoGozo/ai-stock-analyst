from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.yfinance_service import fetch_fundamentals
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/fundamentals", tags=["fundamentals"])


class FundamentalsResponse(BaseModel):
    ticker: str
    name: Optional[str] = None
    exchange: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    currency: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    marketCap: Optional[float] = None
    peRatio: Optional[float] = None
    forwardPE: Optional[float] = None
    eps: Optional[float] = None
    dividendYield: Optional[float] = None
    beta: Optional[float] = None
    week52High: Optional[float] = None
    week52Low: Optional[float] = None
    returnOnEquity: Optional[float] = None
    profitMargin: Optional[float] = None
    operatingMargin: Optional[float] = None
    revenueGrowth: Optional[float] = None
    earningsGrowth: Optional[float] = None
    priceToBook: Optional[float] = None
    evToRevenue: Optional[float] = None
    evToEbitda: Optional[float] = None
    sharesOutstanding: Optional[float] = None
    analystTargetPrice: Optional[float] = None
    recommendationKey: Optional[str] = None
    numberOfAnalysts: Optional[int] = None
    currentPrice: Optional[float] = None
    previousClose: Optional[float] = None
    volume: Optional[int] = None
    averageVolume: Optional[int] = None


@router.get("/{ticker}", response_model=FundamentalsResponse)
async def get_fundamentals(ticker: str):
    ticker = ticker.upper()
    cache_key = f"fundamentals:{ticker}"

    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        data = fetch_fundamentals(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch fundamentals for {ticker}: {str(e)}")

    await cache_set(cache_key, data, settings.cache_fundamentals_ttl)
    return data
