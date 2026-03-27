CREATE TABLE IF NOT EXISTS watchlists (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker    VARCHAR(10) NOT NULL,
  added_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
