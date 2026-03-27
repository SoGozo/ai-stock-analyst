"""
Data ingestion script — seeds price_history table for AAPL, TSLA, MSFT (and any extra tickers).
Also populates the stocks registry with fundamentals.

Usage:
    cd ml-service
    python scripts/seed_price_history.py
    python scripts/seed_price_history.py --tickers NVDA GOOGL AMZN
"""
import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
import psycopg2.extras
from datetime import datetime
from services.yfinance_service import fetch_ohlcv, fetch_fundamentals
from core.config import settings

DEFAULT_TICKERS = ["AAPL", "TSLA", "MSFT"]


def get_db():
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL not set in .env")
    return psycopg2.connect(settings.database_url)


def upsert_stock(cur, fundamentals: dict):
    cur.execute("""
        INSERT INTO stocks (
            ticker, name, exchange, sector, industry, currency, country, description,
            market_cap, pe_ratio, eps, dividend_yield, week_52_high, week_52_low,
            beta, roe, profit_margin, updated_at
        ) VALUES (
            %(ticker)s, %(name)s, %(exchange)s, %(sector)s, %(industry)s,
            %(currency)s, %(country)s, %(description)s,
            %(marketCap)s, %(peRatio)s, %(eps)s, %(dividendYield)s,
            %(week52High)s, %(week52Low)s, %(beta)s,
            %(returnOnEquity)s, %(profitMargin)s, NOW()
        )
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            market_cap = EXCLUDED.market_cap,
            pe_ratio = EXCLUDED.pe_ratio,
            eps = EXCLUDED.eps,
            dividend_yield = EXCLUDED.dividend_yield,
            week_52_high = EXCLUDED.week_52_high,
            week_52_low = EXCLUDED.week_52_low,
            beta = EXCLUDED.beta,
            roe = EXCLUDED.roe,
            profit_margin = EXCLUDED.profit_margin,
            updated_at = NOW()
    """, fundamentals)


def upsert_price_history(cur, ticker: str, bars: list[dict]):
    """Bulk upsert using execute_values for speed."""
    rows = [
        (ticker, bar["date"], bar["open"], bar["high"], bar["low"], bar["close"], bar["volume"])
        for bar in bars
    ]
    psycopg2.extras.execute_values(
        cur,
        """
        INSERT INTO price_history (ticker, date, open, high, low, close, volume, source)
        VALUES %s
        ON CONFLICT (ticker, date) DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume
        """,
        [(r[0], r[1], r[2], r[3], r[4], r[5], r[6], "yfinance") for r in rows],
        template="(%s, %s, %s, %s, %s, %s, %s, %s)",
        page_size=500,
    )
    return len(rows)


def seed_ticker(cur, ticker: str, period: str = "2y"):
    print(f"\n[{ticker}] Fetching fundamentals from yfinance...")
    try:
        fundamentals = fetch_fundamentals(ticker)
        upsert_stock(cur, fundamentals)
        name = fundamentals.get("name", ticker)
        print(f"[{ticker}] ✓ Stock registry updated — {name}")
    except Exception as e:
        print(f"[{ticker}] ✗ Fundamentals failed: {e}")
        # Still try to insert minimal record so FK constraint passes
        cur.execute("""
            INSERT INTO stocks (ticker) VALUES (%s)
            ON CONFLICT (ticker) DO NOTHING
        """, (ticker,))

    print(f"[{ticker}] Fetching {period} of OHLCV from yfinance...")
    try:
        df = fetch_ohlcv(ticker, period=period)
        bars = [
            {
                "date": idx.date(),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
            }
            for idx, row in df.iterrows()
        ]
        count = upsert_price_history(cur, ticker, bars)
        print(f"[{ticker}] ✓ {count} bars upserted into price_history")
    except Exception as e:
        print(f"[{ticker}] ✗ Price history failed: {e}")


def main():
    parser = argparse.ArgumentParser(description="Seed price_history for given tickers")
    parser.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS, help="Ticker symbols to seed")
    parser.add_argument("--period", default="2y", help="yfinance period (1y, 2y, 5y, max)")
    args = parser.parse_args()

    tickers = [t.upper() for t in args.tickers]
    print(f"Seeding {len(tickers)} ticker(s): {', '.join(tickers)}")
    print(f"Connecting to: {settings.database_url[:40]}...")

    try:
        conn = get_db()
    except Exception as e:
        print(f"✗ DB connection failed: {e}")
        sys.exit(1)

    try:
        with conn:
            with conn.cursor() as cur:
                for ticker in tickers:
                    seed_ticker(cur, ticker, args.period)
        print(f"\n✓ Done. Seeded {len(tickers)} ticker(s) successfully.")
    except Exception as e:
        print(f"\n✗ Seeding failed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
