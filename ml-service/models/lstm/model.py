"""
LSTM model builder. Lazily imports TensorFlow so the service starts
even if TF is not installed (Python 3.14 has no TF wheels yet).
"""


def build_lstm_model(sequence_length: int = 60, n_features: int = 5):
    try:
        import tensorflow as tf
        from tensorflow import keras
    except ImportError:
        raise RuntimeError(
            "TensorFlow is not installed. Run: pip install tensorflow==2.15.1 "
            "(requires Python <=3.12). The /predict endpoint is unavailable until TF is installed."
        )

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
        loss="huber",
        metrics=["mae"],
    )

    return model
