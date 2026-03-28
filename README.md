# AI Stock Analyst Dashboard

A full-stack fintech platform that combines real-time market data, LSTM-powered price predictions, and FinBERT sentiment analysis to deliver actionable stock insights.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/Express-4-green) ![Tech Stack](https://img.shields.io/badge/FastAPI-Python_3.11-orange) ![Tech Stack](https://img.shields.io/badge/PostgreSQL-16-blue) ![Tech Stack](https://img.shields.io/badge/TensorFlow-2.15-red) ![Tech Stack](https://img.shields.io/badge/Docker-Compose-2496ED)

## Features

- **Interactive Candlestick Charts** -- OHLCV data with configurable timeframes (1m, 3m, 6m, 1y, 2y)
- **LSTM Price Predictions** -- Multi-day forecasts with 95% confidence intervals
- **FinBERT Sentiment Analysis** -- Real-time NLP on financial news with bullish/bearish classification
- **Technical Indicators** -- RSI, MACD, SMA, EMA, Bollinger Bands
- **Company Fundamentals** -- P/E, market cap, EPS, dividend yield, beta, ROE
- **Watchlist Management** -- Track favorite stocks with persistent storage
- **JWT Authentication** -- Secure login with access/refresh token rotation
- **Redis Caching** -- Multi-tier TTLs to optimize API rate limits

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────>│   Backend    │────>│  ML Service   │
│  React/Vite  │     │  Express.js  │     │   FastAPI     │
│  Port 3000   │     │  Port 4000   │     │  Port 8000    │
└──────────────┘     └──────┬───────┘     └───────┬───────┘
                            │                     │
                     ┌──────┴───────┐      ┌──────┴───────┐
                     │  PostgreSQL  │      │    Redis     │
                     │  Port 5432   │      │  Port 6379   │
                     └──────────────┘      └──────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, TanStack Query, Lightweight Charts, Recharts |
| **Backend** | Node.js 22, Express 4, TypeScript, Zod, Pino, BullMQ, Helmet, JWT |
| **ML Service** | Python 3.11, FastAPI, TensorFlow 2.15, PyTorch, FinBERT, scikit-learn, yfinance |
| **Database** | PostgreSQL 16, Redis 7 |
| **Infrastructure** | Docker, Docker Compose, Nginx |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- (Optional for local dev) Node.js 22+, Python 3.11+

### Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url> && cd fintech

# Copy environment variables
cp .env.example .env

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Add the generated secrets to .env for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

# Start all services
docker-compose up --build
```

The app will be available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| ML Service | http://localhost:8000 |
| ML Docs (Swagger) | http://localhost:8000/docs |

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
npm install
npm run dev          # http://localhost:4000

# ML Service
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

> Requires PostgreSQL and Redis running locally or via Docker.

## Environment Variables

```env
# Database
POSTGRES_USER=fintech
POSTGRES_PASSWORD=fintech_secret
POSTGRES_DB=fintech_db

# Redis
REDIS_PASSWORD=redis_secret

# JWT (generate unique secrets for each)
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>

# External APIs
ALPHA_VANTAGE_API_KEY=<your-key>
NEWS_API_KEY=<your-key>
```

Get free API keys from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and [NewsAPI](https://newsapi.org/register).

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive JWT tokens |
| POST | `/api/auth/refresh` | Renew access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Get current user profile |

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/search?q=AAPL` | Search symbols |
| GET | `/api/stocks/:ticker/quote` | Current price & OHLC |
| GET | `/api/stocks/:ticker/history?range=1y` | Historical OHLCV data |
| GET | `/api/stocks/:ticker/news` | Recent financial news |
| GET | `/api/stocks/:ticker/predict?days=30` | LSTM price forecast |
| GET | `/api/stocks/:ticker/sentiment` | Aggregated sentiment score |

### ML Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ml/predict/:ticker?days=30` | LSTM prediction with confidence intervals |
| GET | `/api/ml/indicators/:ticker` | Technical indicators (RSI, MACD, SMA, EMA, Bollinger) |
| GET | `/api/ml/news/:ticker?analyze=true` | News with FinBERT sentiment scores |
| GET | `/api/ml/fundamentals/:ticker` | Company fundamentals via yfinance |
| GET | `/api/ml/history/:ticker` | OHLCV history via yfinance |

### Watchlist (auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | List saved tickers |
| POST | `/api/watchlist` | Add ticker |
| DELETE | `/api/watchlist/:ticker` | Remove ticker |

## ML Models

### LSTM Price Prediction

- **Architecture:** 3-layer LSTM (128 -> 64 -> 32 units) with Dense output
- **Input:** 60-day lookback window of normalized OHLCV features
- **Training:** 2 years of historical data, 80/20 split, Huber loss, early stopping
- **Output:** Multi-day recursive forecast with 95% confidence intervals (RMSE-based)
- **Metrics:** MAPE, RMSE, MAE, R-squared
- **Caching:** Predictions cached 6 hours in Redis

Models are trained on-demand per ticker (~30-60s on first request) and saved to `ml-service/saved_models/`.

### FinBERT Sentiment Analysis

- **Model:** [ProsusAI/finbert](https://huggingface.co/ProsusAI/finbert) fine-tuned on financial text
- **Scoring:** Composite score = P(positive) - P(negative), weighted by recency (48hr half-life)
- **Classification:** Bullish (>0.1), Bearish (<-0.1), Neutral
- **Caching:** 15 minutes in Redis

## Project Structure

```
fintech/
├── frontend/               # React SPA
│   └── src/
│       ├── pages/          # Dashboard, StockDetail, Watchlist, Login, Register
│       ├── components/     # Charts, StockHeader, FundamentalCard, NewsCard
│       ├── hooks/          # useStockData (TanStack Query wrappers)
│       ├── api/            # Axios client & API methods
│       └── store/          # Zustand stores (auth, watchlist, ticker)
├── backend/                # Express API gateway
│   └── src/
│       ├── routes/         # auth, stock, watchlist, ml
│       ├── controllers/    # Request handlers
│       ├── services/       # Alpha Vantage, NewsAPI, ML proxy
│       ├── middleware/     # Auth, caching, error handling
│       └── models/         # Database queries
├── ml-service/             # FastAPI ML server
│   ├── api/routes/         # Prediction, sentiment, indicators, news
│   ├── models/             # LSTM & FinBERT implementations
│   ├── services/           # Data fetchers (yfinance, news)
│   └── saved_models/       # Trained model artifacts per ticker
├── database/
│   └── migrations/         # PostgreSQL schema (7 migration files)
├── docker-compose.yml
└── .env.example
```

## License

This project is for educational and personal use.