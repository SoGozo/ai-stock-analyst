from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from services.news_service import fetch_stock_news
from services.yfinance_service import fetch_company_info
from models.sentiment.analyzer import analyze_batch
from models.sentiment.aggregator import aggregate_sentiment
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/news", tags=["news"])


class Article(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    source: str
    publishedAt: Optional[str] = None
    urlToImage: Optional[str] = None
    sentimentScore: Optional[float] = None
    sentimentLabel: Optional[str] = None


class NewsResponse(BaseModel):
    ticker: str
    articles: list[Article]
    count: int
    overallSentiment: Optional[dict] = None


@router.get("/{ticker}", response_model=NewsResponse)
async def get_news(
    ticker: str,
    analyze: bool = Query(default=True, description="Run FinBERT sentiment on each article"),
    limit: int = Query(default=20, ge=1, le=50),
):
    ticker = ticker.upper()
    cache_key = f"news:{ticker}:{'scored' if analyze else 'raw'}"

    cached = await cache_get(cache_key)
    if cached:
        return {**cached, "cached": True}

    # Fetch company info and news in parallel
    import asyncio

    async def _get_company_name():
        try:
            loop = asyncio.get_event_loop()
            info = await loop.run_in_executor(None, fetch_company_info, ticker)
            return info.get("name")
        except Exception:
            return None

    # Start both tasks concurrently — news can start with just the ticker
    company_name_task = asyncio.create_task(_get_company_name())
    basic_news_task = asyncio.create_task(fetch_stock_news(ticker, None, page_size=limit))

    company_name = await company_name_task

    # If we got a company name, re-fetch with better query; otherwise use basic results
    try:
        if company_name:
            articles = await fetch_stock_news(ticker, company_name, page_size=limit)
        else:
            articles = await basic_news_task
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NewsAPI error: {str(e)}")

    if not articles:
        return {"ticker": ticker, "articles": [], "count": 0, "overallSentiment": None}

    if analyze and articles:
        texts = [f"{a['title']}. {a.get('description') or ''}".strip() for a in articles]
        try:
            scores = analyze_batch(texts)
            dates = [a.get("publishedAt") for a in articles]
            for article, score in zip(articles, scores):
                composite = score["positive"] - score["negative"]
                label = "Bullish" if composite > 0.1 else ("Bearish" if composite < -0.1 else "Neutral")
                article["sentimentScore"] = round(composite, 4)
                article["sentimentLabel"] = label

            overall = aggregate_sentiment(scores, dates)
        except Exception:
            overall = None
    else:
        overall = None

    result = {"ticker": ticker, "articles": articles[:limit], "count": len(articles), "overallSentiment": overall}
    await cache_set(cache_key, result, settings.cache_news_ttl)
    return result
