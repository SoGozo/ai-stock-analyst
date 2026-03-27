/**
 * Deterministic pseudo-random walk to generate realistic OHLCV bars.
 * Seeded so the same ticker always produces the same history.
 */
import type { OHLCVBar } from "./types";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateHistory(
  ticker: string,
  startPrice: number,
  days = 365,
  volatility = 0.015,
  drift = 0.0003
): OHLCVBar[] {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = mulberry32(seed * 31337);

  const bars: OHLCVBar[] = [];
  let close = startPrice;

  // Start date: 365 trading days ago (approx)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.round(days * 1.4)); // account for weekends

  let d = new Date(startDate);
  let count = 0;

  while (count < days) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const dailyReturn = drift + volatility * (rand() * 2 - 1) * Math.sqrt(1);
      const open = close * (1 + volatility * (rand() - 0.5) * 0.3);
      close = open * (1 + dailyReturn);
      const intraRange = close * volatility * (0.5 + rand() * 1.0);
      const high = Math.max(open, close) + intraRange * rand();
      const low = Math.min(open, close) - intraRange * rand();
      const volume = Math.round((5e6 + rand() * 5e7) * (1 + Math.abs(dailyReturn) * 10));

      bars.push({
        date: d.toISOString().split("T")[0],
        open: round(open),
        high: round(high),
        low: round(Math.max(0.01, low)),
        close: round(close),
        volume,
      });
      count++;
    }
    d.setDate(d.getDate() + 1);
  }

  return bars;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function generatePredictions(
  ticker: string,
  lastClose: number,
  rmse: number,
  days = 30
): { date: string; price: number; lower: number; upper: number }[] {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 42);
  const rand = mulberry32(seed);

  const preds = [];
  let price = lastClose;
  const d = new Date();
  let count = 0;

  while (count < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    price = price * (1 + 0.0002 + 0.008 * (rand() - 0.5));
    const p = round(price);
    preds.push({
      date: d.toISOString().split("T")[0],
      price: p,
      lower: round(p - 1.96 * rmse),
      upper: round(p + 1.96 * rmse),
    });
    count++;
  }
  return preds;
}
