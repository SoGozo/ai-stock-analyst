from pydantic import BaseModel
from typing import Literal


class ArticleInput(BaseModel):
    title: str
    description: str | None = None
    publishedAt: str | None = None


class SentimentBreakdown(BaseModel):
    positive: float
    negative: float
    neutral: float


class SentimentResponse(BaseModel):
    ticker: str
    score: float
    label: Literal["Bullish", "Bearish", "Neutral"]
    breakdown: SentimentBreakdown
    articlesAnalyzed: int


class SentimentRequest(BaseModel):
    articles: list[ArticleInput]
