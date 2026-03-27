"""
FinBERT-based sentiment analyzer for financial news.
Lazily loads model so service starts even without torch/transformers installed.
"""
from __future__ import annotations

_tokenizer = None
_model = None
_MODEL_NAME = "ProsusAI/finbert"


def _load_model():
    global _tokenizer, _model
    if _tokenizer is not None:
        return

    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
    except ImportError:
        raise RuntimeError(
            "torch/transformers not installed. Run: pip install torch transformers sentencepiece"
        )

    _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
    _model = AutoModelForSequenceClassification.from_pretrained(_MODEL_NAME)
    _model.eval()


def analyze_batch(texts: list[str]) -> list[dict]:
    """
    Analyze a batch of financial texts with FinBERT.
    Returns list of {positive, negative, neutral} dicts.
    """
    _load_model()

    import torch

    results = []
    batch_size = 8
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        inputs = _tokenizer(
            batch,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )
        with torch.no_grad():
            outputs = _model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1).numpy()

        # FinBERT label order: positive=0, negative=1, neutral=2
        for row in probs:
            results.append({
                "positive": float(row[0]),
                "negative": float(row[1]),
                "neutral": float(row[2]),
            })

    return results
