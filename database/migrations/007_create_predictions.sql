-- LSTM model predictions
CREATE TABLE IF NOT EXISTS predictions (
  id            BIGSERIAL PRIMARY KEY,
  ticker        VARCHAR(10) NOT NULL REFERENCES stocks(ticker) ON DELETE CASCADE,
  predicted_for DATE NOT NULL,
  predicted_at  TIMESTAMPTZ DEFAULT NOW(),
  price         NUMERIC(12,4) NOT NULL,
  lower_bound   NUMERIC(12,4),
  upper_bound   NUMERIC(12,4),
  mape          NUMERIC(8,4),
  rmse          NUMERIC(12,4),
  confidence    NUMERIC(6,2),
  model_version VARCHAR(20) DEFAULT 'lstm_v1',
  UNIQUE(ticker, predicted_for, model_version)
);

CREATE INDEX IF NOT EXISTS idx_predictions_ticker_date ON predictions(ticker, predicted_for DESC);
