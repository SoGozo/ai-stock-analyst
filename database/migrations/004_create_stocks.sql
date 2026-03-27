-- Master stock registry
CREATE TABLE IF NOT EXISTS stocks (
  ticker        VARCHAR(10) PRIMARY KEY,
  name          VARCHAR(255),
  exchange      VARCHAR(20),
  sector        VARCHAR(100),
  industry      VARCHAR(100),
  currency      VARCHAR(10) DEFAULT 'USD',
  country       VARCHAR(50),
  description   TEXT,
  market_cap    BIGINT,
  pe_ratio      NUMERIC(10,4),
  eps           NUMERIC(10,4),
  dividend_yield NUMERIC(8,6),
  week_52_high  NUMERIC(12,4),
  week_52_low   NUMERIC(12,4),
  beta          NUMERIC(8,4),
  roe           NUMERIC(10,6),
  profit_margin NUMERIC(10,6),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);
