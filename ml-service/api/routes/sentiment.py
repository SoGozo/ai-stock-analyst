from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Literal
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class ArticleInput(BaseModel):
    title: str
    description: Optional[str] = None
    publishedAt: Optional[str] = None


class SentimentBreakdown(BaseModel):
    positive: float
    negative: float
    neutral: float


class ScoredArticle(BaseModel):
    title: str
    sentimentScore: float
    sentimentLabel: str


class SentimentResponse(BaseModel):
    ticker: str
    score: float                               # -1.0 to +1.0
    label: Literal["Bullish", "Bearish", "Neutral"]
    breakdown: SentimentBreakdown
    articlesAnalyzed: int
    topBullish: list[ScoredArticle]
    topBearish: list[ScoredArticle]
    cached: Optional[bool] = None


class SentimentRequest(BaseModel):
    articles: list[ArticleInput]


# ─── Endpoint ────────────────────────────────────────────────────────────────

@router.post("/{ticker}", response_model=SentimentResponse)
async def get_sentiment(
    ticker: str,
    body: SentimentRequest,
    max_articles: int = Query(default=20, ge=1, le=50),
    refresh: bool = Query(default=False),
):
    """
    Run FinBERT over up to `max_articles` headlines → single [-1.0, +1.0] score.

    Scoring:
      - Per-article composite = positive_prob − negative_prob
      - Weighted by recency (exponential decay, 48hr half-life)
      - Bullish if composite > 0.1, Bearish if < -0.1, else Neutral

    Cached in Redis for 15 min (TTL configurable via CACHE_SENTIMENT_TTL).
    """
    ticker = ticker.upper()
    cache_key = f"sentiment:{ticker}"

    if not refresh:
        cached = await cache_get(cache_key)
        if cached:
            return {**cached, "cached": True}

    articles = body.articles[:max_articles]
    if not articles:
        raise HTTPException(status_code=422, detail="No articles provided")

    texts = [
        f"{a.title}. {a.description or ''}".strip()
        for a in articles
    ]
    dates = [a.publishedAt for a in articles]

    try:
        from models.sentiment.analyzer import analyze_batch
        scores = analyze_batch(texts)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FinBERT inference failed: {str(e)}")

    from models.sentiment.aggregator import aggregate_sentiment
    aggregated = aggregate_sentiment(scores, dates)

    # Build per-article composite for top-N lists
    per_article = []
    for article, score in zip(articles, scores):
        composite = round(score["positive"] - score["negative"], 4)
        label = "Bullish" if composite > 0.1 else ("Bearish" if composite < -0.1 else "Neutral")
        per_article.append({
            "title": article.title,
            "sentimentScore": composite,
            "sentimentLabel": label,
        })

    sorted_by_score = sorted(per_article, key=lambda x: x["sentimentScore"], reverse=True)
    top_bullish = [a for a in sorted_by_score if a["sentimentLabel"] == "Bullish"][:3]
    top_bearish = [a for a in reversed(sorted_by_score) if a["sentimentLabel"] == "Bearish"][:3]

    result = {
        "ticker":           ticker,
        "score":            aggregated["score"],
        "label":            aggregated["label"],
        "breakdown":        aggregated["breakdown"],
        "articlesAnalyzed": aggregated["articlesAnalyzed"],
        "topBullish":       top_bullish,
        "topBearish":       top_bearish,
    }

    await cache_set(cache_key, result, settings.cache_sentiment_ttl)
    return {**result, "cached": False}
