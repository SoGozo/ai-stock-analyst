import numpy as np
import pandas as pd
from datetime import date, timedelta
from models.lstm.trainer import train_model, load_model_and_preprocessor
from services.yfinance_service import fetch_ohlcv
from core.config import settings


def predict(ticker: str, days: int = 30) -> dict:
    """
    Run LSTM prediction for a ticker.
    Trains model on-demand if not cached to disk.
    Uses recursive multi-step forecasting.
    """
    model, preprocessor = load_model_and_preprocessor(ticker)

    if model is None:
        metrics = train_model(ticker)
        model, preprocessor = load_model_and_preprocessor(ticker)
    else:
        # Re-evaluate metrics on fresh data
        df_eval = fetch_ohlcv(ticker, period="3m")
        scaled = preprocessor.transform(df_eval)
        seq_len = settings.lstm_sequence_length
        if len(scaled) > seq_len:
            X_recent = scaled[-seq_len:].reshape(1, seq_len, 5)
            pred_scaled = model.predict(X_recent, verbose=0).flatten()
            pred_actual = preprocessor.inverse_close(pred_scaled)
            actual_close = df_eval["Close"].values[-1]
            mape = float(abs(actual_close - pred_actual[0]) / (actual_close + 1e-8) * 100)
            rmse = float(abs(actual_close - pred_actual[0]))
        else:
            mape, rmse = 0.0, 0.0
        metrics = {"mape": mape, "rmse": rmse}

    # Fetch recent data to seed the recursive forecast
    df = fetch_ohlcv(ticker, period="6m")
    seq_len = settings.lstm_sequence_length
    scaled_data = preprocessor.transform(df)

    if len(scaled_data) < seq_len:
        raise ValueError(f"Not enough data for {ticker}")

    window = scaled_data[-seq_len:].copy()  # shape (seq_len, 5)
    raw_preds = []

    for _ in range(days):
        X = window.reshape(1, seq_len, 5)
        next_close_scaled = model.predict(X, verbose=0)[0, 0]
        raw_preds.append(next_close_scaled)

        # Shift window: drop oldest, append new row with predicted close
        new_row = window[-1].copy()
        new_row[3] = next_close_scaled  # update close
        window = np.vstack([window[1:], new_row])

    predicted_closes = preprocessor.inverse_close(np.array(raw_preds))

    # Compute confidence interval from residuals on last known data
    recent_scaled = scaled_data[-seq_len - 10 : -1]
    residuals = []
    for i in range(len(recent_scaled) - seq_len):
        X_r = recent_scaled[i : i + seq_len].reshape(1, seq_len, 5)
        pred_s = model.predict(X_r, verbose=0)[0, 0]
        pred_r = preprocessor.inverse_close(np.array([pred_s]))[0]
        actual_r = preprocessor.inverse_close(np.array([recent_scaled[i + seq_len, 3]]))[0]
        residuals.append(abs(pred_r - actual_r))

    std = float(np.std(residuals)) if residuals else predicted_closes.std() * 0.05
    z = 1.96  # 95% CI

    last_date = df.index[-1].date()
    predictions = []
    for i, price in enumerate(predicted_closes):
        pred_date = last_date + timedelta(days=i + 1)
        # Skip weekends (simple approximation)
        while pred_date.weekday() >= 5:
            pred_date += timedelta(days=1)
        predictions.append({
            "date": pred_date.isoformat(),
            "price": round(float(price), 2),
            "lower": round(float(price - z * std), 2),
            "upper": round(float(price + z * std), 2),
        })

    confidence = max(0, min(100, round(100 - metrics.get("mape", 10), 1)))

    return {
        "ticker": ticker.upper(),
        "predictions": predictions,
        "mape": round(metrics.get("mape", 0), 2),
        "rmse": round(metrics.get("rmse", 0), 2),
        "confidence": confidence,
        "trainedOn": len(df),
    }
