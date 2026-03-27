"""
Sentiment aggregator — turns per-article FinBERT scores into a
single composite score in [-1.0, +1.0].

Algorithm:
  1. Compute per-article composite = positive - negative  (range [-1, +1])
  2. Weight by recency: exponential decay with 48hr half-life
  3. Weighted average → final score
  4. Threshold: score > 0.1 → Bullish, < -0.1 → Bearish, else Neutral
"""
import numpy as np
from datetime import datetime, timezone


def aggregate_sentiment(
    scores: list[dict],
    published_dates: list[str | None] | None = None,
) -> dict:
    """
    Args:
        scores: list of {positive, negative, neutral} dicts from analyze_batch().
        published_dates: ISO-8601 strings (or None) parallel to scores.

    Returns:
        {score, label, breakdown: {positive, negative, neutral}, articlesAnalyzed}
    """
    if not scores:
        return {
            "score": 0.0,
            "label": "Neutral",
            "breakdown": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
            "articlesAnalyzed": 0,
        }

    n = len(scores)
    weights = np.ones(n)

    if published_dates:
        now = datetime.now(timezone.utc)
        for i, date_str in enumerate(published_dates):
            if not date_str:
                continue
            try:
                pub = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                if pub.tzinfo is None:
                    pub = pub.replace(tzinfo=timezone.utc)
                age_hours = max(0.0, (now - pub).total_seconds() / 3600)
                # Exponential decay: weight halves every 48 hours
                weights[i] = np.exp(-0.693 * age_hours / 48)
            except Exception:
                pass   # keep weight = 1.0

    total_weight = weights.sum()
    if total_weight == 0:
        weights = np.ones(n)
        total_weight = float(n)

    weights /= total_weight

    pos = float(np.dot([s["positive"] for s in scores], weights))
    neg = float(np.dot([s["negative"] for s in scores], weights))
    neu = float(np.dot([s["neutral"]  for s in scores], weights))

    composite = round(pos - neg, 6)   # range [-1, +1]

    if composite > 0.1:
        label = "Bullish"
    elif composite < -0.1:
        label = "Bearish"
    else:
        label = "Neutral"

    return {
        "score":    composite,
        "label":    label,
        "breakdown": {
            "positive": round(pos, 6),
            "negative": round(neg, 6),
            "neutral":  round(neu, 6),
        },
        "articlesAnalyzed": n,
    }
