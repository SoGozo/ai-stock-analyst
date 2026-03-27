from fastapi import APIRouter, HTTPException
from schemas.sentiment import SentimentRequest, SentimentResponse
from models.sentiment.analyzer import analyze_batch
from models.sentiment.aggregator import aggregate_sentiment
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


@router.post("/{ticker}", response_model=SentimentResponse)
async def get_sentiment(ticker: str, body: SentimentRequest):
    ticker = ticker.upper()
    cache_key = f"sentiment:{ticker}"

    cached = await cache_get(cache_key)
    if cached:
        return cached

    articles = body.articles
    if not articles:
        raise HTTPException(status_code=422, detail="No articles provided")

    texts = [
        f"{a.title}. {a.description or ''}" for a in articles
    ]
    dates = [a.publishedAt for a in articles]

    try:
        scores = analyze_batch(texts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

    aggregated = aggregate_sentiment(scores, dates)

    result = {
        "ticker": ticker,
        "score": aggregated["score"],
        "label": aggregated["label"],
        "breakdown": aggregated["breakdown"],
        "articlesAnalyzed": len(articles),
    }

    await cache_set(cache_key, result, settings.cache_sentiment_ttl)
    return result
