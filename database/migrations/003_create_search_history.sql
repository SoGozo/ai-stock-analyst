CREATE TABLE IF NOT EXISTS search_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  ticker      VARCHAR(10) NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_ticker ON search_history(ticker);
