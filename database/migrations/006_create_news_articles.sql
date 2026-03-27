-- Financial news articles with sentiment scores
CREATE TABLE IF NOT EXISTS news_articles (
  id              BIGSERIAL PRIMARY KEY,
  ticker          VARCHAR(10) NOT NULL REFERENCES stocks(ticker) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  url             TEXT UNIQUE NOT NULL,
  source          VARCHAR(100),
  published_at    TIMESTAMPTZ NOT NULL,
  sentiment_score NUMERIC(6,4),          -- -1 to +1
  sentiment_label VARCHAR(10),           -- Bullish / Bearish / Neutral
  pos_score       NUMERIC(6,4),
  neg_score       NUMERIC(6,4),
  neu_score       NUMERIC(6,4),
  fetched_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_ticker_date ON news_articles(ticker, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_articles(ticker, sentiment_label);
