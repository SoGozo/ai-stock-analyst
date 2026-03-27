import tensorflow as tf
from tensorflow import keras


def build_lstm_model(sequence_length: int = 60, n_features: int = 5) -> keras.Model:
    """
    3-layer stacked LSTM for stock price prediction.
    Architecture chosen to capture both short-term patterns (first LSTM)
    and longer-range dependencies (deeper layers) without overfitting.
    """
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(sequence_length, n_features)),
            keras.layers.LSTM(128, return_sequences=True),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(64, return_sequences=True),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(32, return_sequences=False),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation="relu"),
            keras.layers.Dense(1),
        ],
        name="stock_price_lstm",
    )

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="huber",  # Huber loss: less sensitive to outliers than MSE
        metrics=["mae"],
    )

    return model
