import numpy as np
from datetime import datetime, timezone


def aggregate_sentiment(
    scores: list[dict],
    published_dates: list[str] | None = None,
) -> dict:
    """
    Aggregate per-article sentiment scores into a single result.
    Applies exponential recency weighting if dates are provided.
    Composite score: positive - negative, range [-1, +1].
    """
    if not scores:
        return {"score": 0.0, "label": "Neutral", "breakdown": {"positive": 0, "negative": 0, "neutral": 0}}

    weights = np.ones(len(scores))

    if published_dates:
        now = datetime.now(timezone.utc)
        for i, date_str in enumerate(published_dates):
            try:
                pub = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                age_hours = max(0, (now - pub).total_seconds() / 3600)
                # Exponential decay: half-life of 48 hours
                weights[i] = np.exp(-0.693 * age_hours / 48)
            except Exception:
                pass

    weights /= weights.sum()

    pos = float(np.average([s["positive"] for s in scores], weights=weights))
    neg = float(np.average([s["negative"] for s in scores], weights=weights))
    neu = float(np.average([s["neutral"] for s in scores], weights=weights))

    composite = round(pos - neg, 4)  # Range [-1, +1]

    if composite > 0.1:
        label = "Bullish"
    elif composite < -0.1:
        label = "Bearish"
    else:
        label = "Neutral"

    return {
        "score": composite,
        "label": label,
        "breakdown": {
            "positive": round(pos, 4),
            "negative": round(neg, 4),
            "neutral": round(neu, 4),
        },
    }
