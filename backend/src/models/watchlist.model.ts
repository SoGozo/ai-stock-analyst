import { db } from "../config/db";

export interface WatchlistEntry {
  id: string;
  user_id: string;
  ticker: string;
  added_at: Date;
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const result = await db.query<WatchlistEntry>(
    `SELECT * FROM watchlists WHERE user_id = $1 ORDER BY added_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function addToWatchlist(userId: string, ticker: string): Promise<WatchlistEntry> {
  const result = await db.query<WatchlistEntry>(
    `INSERT INTO watchlists (user_id, ticker) VALUES ($1, $2)
     ON CONFLICT (user_id, ticker) DO NOTHING
     RETURNING *`,
    [userId, ticker.toUpperCase()]
  );
  return result.rows[0];
}

export async function removeFromWatchlist(userId: string, ticker: string): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM watchlists WHERE user_id = $1 AND ticker = $2`,
    [userId, ticker.toUpperCase()]
  );
  return (result.rowCount ?? 0) > 0;
}
