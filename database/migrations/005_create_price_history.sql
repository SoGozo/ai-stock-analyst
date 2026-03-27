-- Daily OHLCV price history
CREATE TABLE IF NOT EXISTS price_history (
  id         BIGSERIAL PRIMARY KEY,
  ticker     VARCHAR(10) NOT NULL REFERENCES stocks(ticker) ON DELETE CASCADE,
  date       DATE NOT NULL,
  open       NUMERIC(12,4) NOT NULL,
  high       NUMERIC(12,4) NOT NULL,
  low        NUMERIC(12,4) NOT NULL,
  close      NUMERIC(12,4) NOT NULL,
  volume     BIGINT,
  source     VARCHAR(20) DEFAULT 'yfinance',
  UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_ticker_date ON price_history(ticker, date DESC);

-- Technical indicators (computed, cached in DB)
CREATE TABLE IF NOT EXISTS technical_indicators (
  id           BIGSERIAL PRIMARY KEY,
  ticker       VARCHAR(10) NOT NULL REFERENCES stocks(ticker) ON DELETE CASCADE,
  date         DATE NOT NULL,
  rsi_14       NUMERIC(8,4),
  macd         NUMERIC(12,6),
  macd_signal  NUMERIC(12,6),
  macd_hist    NUMERIC(12,6),
  sma_20       NUMERIC(12,4),
  sma_50       NUMERIC(12,4),
  sma_200      NUMERIC(12,4),
  ema_12       NUMERIC(12,4),
  ema_26       NUMERIC(12,4),
  bb_upper     NUMERIC(12,4),
  bb_middle    NUMERIC(12,4),
  bb_lower     NUMERIC(12,4),
  UNIQUE(ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_indicators_ticker_date ON technical_indicators(ticker, date DESC);
