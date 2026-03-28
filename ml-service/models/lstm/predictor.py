"""
LSTM inference engine.
Loads model.h5 + scaler.pkl from saved_models/{ticker}/.
Falls back to on-demand training if no saved model exists.

Models are cached in memory after first load to avoid repeated disk I/O.
"""
import os
import json
import pickle
import logging
import numpy as np
from datetime import timedelta

from services.yfinance_service import fetch_ohlcv
from core.config import settings

log = logging.getLogger(__name__)

SEQ_LEN   = 60
FEATURES  = ["Open", "High", "Low", "Close", "Volume"]
TARGET_IDX = 3    # Close

# ── In-memory model cache ───────────────────────────────────────────────────
_model_cache: dict[str, tuple] = {}   # ticker → (model, scaler, metrics)
_keras = None


def _get_keras():
    """Import keras once and cache the module reference."""
    global _keras
    if _keras is not None:
        return _keras
    try:
        from tensorflow import keras
        _keras = keras
        return _keras
    except ImportError:
        raise RuntimeError("TensorFlow not installed (requires Python <=3.12)")


def _load_artifacts(ticker: str):
    """Load model + scaler from disk (or memory cache). Returns (model, scaler, metrics) or (None, None, None)."""
    ticker = ticker.upper()

    cached = _model_cache.get(ticker)
    if cached:
        return cached

    model_dir = os.path.join(settings.model_cache_dir, ticker)
    h5_path     = os.path.join(model_dir, "model.h5")
    keras_path  = os.path.join(model_dir, "model.keras")
    scaler_path = os.path.join(model_dir, "scaler.pkl")
    metrics_path = os.path.join(model_dir, "metrics.json")

    if not os.path.exists(scaler_path):
        return None, None, None

    model_path = h5_path if os.path.exists(h5_path) else keras_path
    if not os.path.exists(model_path):
        return None, None, None

    keras = _get_keras()

    log.info("Loading LSTM model for %s from disk...", ticker)
    model = keras.models.load_model(model_path, compile=False)
    model.compile(optimizer="adam", loss="huber", metrics=["mae"])

    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)

    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            metrics = json.load(f)

    _model_cache[ticker] = (model, scaler, metrics)
    log.info("LSTM model for %s cached in memory.", ticker)
    return model, scaler, metrics


def _inverse_close(scaler, scaled_close: np.ndarray) -> np.ndarray:
    dummy = np.zeros((len(scaled_close), len(FEATURES)))
    dummy[:, TARGET_IDX] = scaled_close
    return scaler.inverse_transform(dummy)[:, TARGET_IDX]


def predict(ticker: str, days: int = 30) -> dict:
    """
    Load saved LSTM model and run recursive multi-step forecast.
    Returns structured dict ready to be JSON-serialised by FastAPI.
    """
    ticker = ticker.upper()
    model, scaler, saved_metrics = _load_artifacts(ticker)

    if model is None:
        # No pre-trained model — train on the fly
        from models.lstm.trainer import train_model, load_model_and_preprocessor
        saved_metrics = train_model(ticker)
        # trainer uses its own preprocessor; reload via load_model_and_preprocessor
        model_v2, preprocessor = load_model_and_preprocessor(ticker)
        if model_v2 is None:
            raise RuntimeError(f"Training failed for {ticker}")
        # Re-enter with the now-saved model
        return predict(ticker, days)

    # ── Fetch recent data to seed the forecast window ────────────────────────
    df = fetch_ohlcv(ticker, period="6m")
    if len(df) < SEQ_LEN:
        raise ValueError(f"Not enough data for {ticker} (need {SEQ_LEN} days)")

    full_scaled = scaler.transform(df[FEATURES].values)
    window = full_scaled[-SEQ_LEN:].copy()   # (60, 5)

    # ── Recursive multi-step forecast ────────────────────────────────────────
    raw_preds = []
    for _ in range(days):
        X_in = window.reshape(1, SEQ_LEN, len(FEATURES))
        next_scaled = float(model.predict(X_in, verbose=0)[0, 0])
        raw_preds.append(next_scaled)
        new_row = window[-1].copy()
        new_row[TARGET_IDX] = next_scaled
        window = np.vstack([window[1:], new_row])

    predicted_prices = _inverse_close(scaler, np.array(raw_preds))

    # ── Confidence interval from saved RMSE ──────────────────────────────────
    rmse = float(saved_metrics.get("rmse", predicted_prices.std() * 0.05))
    std  = rmse
    z    = 1.96   # 95% CI

    # ── Build date list (business days only) ─────────────────────────────────
    last_date = df.index[-1].date()
    from pandas import bdate_range
    forecast_dates = list(bdate_range(
        start=last_date + timedelta(days=1), periods=days
    ))

    predictions = [
        {
            "date":  str(d.date()),
            "price": round(float(p), 2),
            "lower": round(float(p - z * std), 2),
            "upper": round(float(p + z * std), 2),
        }
        for d, p in zip(forecast_dates, predicted_prices)
    ]

    confidence = max(0.0, min(100.0, round(100.0 - float(saved_metrics.get("mape", 10.0)), 1)))

    return {
        "ticker":      ticker,
        "predictions": predictions,
        "mape":        round(float(saved_metrics.get("mape", 0)), 4),
        "rmse":        round(float(saved_metrics.get("rmse", 0)), 4),
        "mae":         round(float(saved_metrics.get("mae",  0)), 4),
        "r2":          round(float(saved_metrics.get("r2",   0)), 4),
        "confidence":  confidence,
        "trainedOn":   int(saved_metrics.get("train_samples", 0)),
        "epochsRun":   int(saved_metrics.get("epochs_run", 0)),
    }
