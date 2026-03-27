import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


class StockPreprocessor:
    def __init__(self, sequence_length: int = 60):
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.close_scaler = MinMaxScaler(feature_range=(0, 1))

    def fit_transform(self, df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
        """
        Fit scalers and create sliding windows.
        Returns X shape (samples, seq_len, features), y shape (samples,)
        """
        features = df[["Open", "High", "Low", "Close", "Volume"]].values
        close = df[["Close"]].values

        scaled_features = self.scaler.fit_transform(features)
        self.close_scaler.fit(close)

        X, y = [], []
        for i in range(self.sequence_length, len(scaled_features)):
            X.append(scaled_features[i - self.sequence_length : i])
            y.append(scaled_features[i, 3])  # index 3 = Close (scaled)

        return np.array(X), np.array(y)

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform new data using already-fitted scaler."""
        features = df[["Open", "High", "Low", "Close", "Volume"]].values
        return self.scaler.transform(features)

    def inverse_close(self, scaled_close: np.ndarray) -> np.ndarray:
        """Inverse transform scaled close prices back to real values."""
        # Rebuild full feature vector for inverse transform
        dummy = np.zeros((len(scaled_close), 5))
        dummy[:, 3] = scaled_close.flatten()
        inversed = self.scaler.inverse_transform(dummy)
        return inversed[:, 3]
