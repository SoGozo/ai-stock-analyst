import os
import pickle
import numpy as np
from tensorflow import keras
from core.config import settings
from models.lstm.model import build_lstm_model
from models.lstm.preprocessor import StockPreprocessor
from services.yfinance_service import fetch_ohlcv


def train_model(ticker: str) -> dict:
    """
    Fetch data, train LSTM, persist model + scaler.
    Returns metrics dict: {mape, rmse, data_points, epochs}.
    """
    df = fetch_ohlcv(ticker, period="2y")
    preprocessor = StockPreprocessor(settings.lstm_sequence_length)
    X, y = preprocessor.fit_transform(df)

    # 80/20 train-test split (chronological — never shuffle time series!)
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = build_lstm_model(settings.lstm_sequence_length)

    callbacks = [
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.5),
    ]

    model.fit(
        X_train, y_train,
        epochs=settings.lstm_epochs,
        batch_size=settings.lstm_batch_size,
        validation_split=0.1,
        callbacks=callbacks,
        verbose=0,
    )

    # Evaluate on held-out test set
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()
    y_pred = preprocessor.inverse_close(y_pred_scaled)
    y_actual = preprocessor.inverse_close(y_test)

    mape = float(np.mean(np.abs((y_actual - y_pred) / (y_actual + 1e-8))) * 100)
    rmse = float(np.sqrt(np.mean((y_actual - y_pred) ** 2)))

    # Persist
    model_dir = os.path.join(settings.model_cache_dir, ticker.upper())
    os.makedirs(model_dir, exist_ok=True)
    model.save(os.path.join(model_dir, "model.keras"))
    with open(os.path.join(model_dir, "preprocessor.pkl"), "wb") as f:
        pickle.dump(preprocessor, f)

    return {
        "mape": mape,
        "rmse": rmse,
        "data_points": len(df),
        "epochs_run": len(model.history.history["loss"]),
    }


def load_model_and_preprocessor(ticker: str) -> tuple:
    """Load persisted model and preprocessor for inference."""
    model_dir = os.path.join(settings.model_cache_dir, ticker.upper())
    model_path = os.path.join(model_dir, "model.keras")
    scaler_path = os.path.join(model_dir, "preprocessor.pkl")

    if not os.path.exists(model_path):
        return None, None

    model = keras.models.load_model(model_path)
    with open(scaler_path, "rb") as f:
        preprocessor = pickle.load(f)

    return model, preprocessor
