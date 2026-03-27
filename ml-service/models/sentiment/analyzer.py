"""
FinBERT sentiment analyzer — ProsusAI/finbert via HuggingFace Transformers.

Why FinBERT over generic BERT:
  Fine-tuned on 10,000+ financial news sentences. Correctly classifies:
  - "margin compression"  → Bearish
  - "exceeds guidance"    → Bullish
  - "in-line with expectations" → Neutral
  Generic models systematically mis-label these as neutral/positive.

Lazy-loads on first call so the service starts instantly.
"""
from __future__ import annotations
import logging

log = logging.getLogger(__name__)

_pipeline = None
_MODEL_NAME = "ProsusAI/finbert"


def _load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    try:
        from transformers import pipeline
    except ImportError:
        raise RuntimeError(
            "transformers not installed. Run: pip install transformers torch sentencepiece"
        )

    log.info("Loading FinBERT model (first call — ~20s download + load)...")
    _pipeline = pipeline(
        "text-classification",
        model=_MODEL_NAME,
        tokenizer=_MODEL_NAME,
        top_k=None,           # return all 3 class scores
        truncation=True,
        max_length=512,
        device=-1,            # CPU; use device=0 for GPU
    )
    log.info("FinBERT loaded.")
    return _pipeline


def analyze_batch(texts: list[str]) -> list[dict]:
    """
    Analyze a list of texts with FinBERT.

    Args:
        texts: list of headline strings (up to 512 tokens each).

    Returns:
        list of dicts: [{positive: float, negative: float, neutral: float}]
        Values are softmax probabilities summing to 1.0 per text.
    """
    pipe = _load_pipeline()

    # Process in batches of 8 to bound memory usage
    results = []
    batch_size = 8
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        # HuggingFace pipeline returns [[{label, score}, ...], ...]
        batch_output = pipe(batch)
        for item_scores in batch_output:
            score_dict = {s["label"].lower(): float(s["score"]) for s in item_scores}
            results.append({
                "positive": score_dict.get("positive", 0.0),
                "negative": score_dict.get("negative", 0.0),
                "neutral":  score_dict.get("neutral",  0.0),
            })

    return results
