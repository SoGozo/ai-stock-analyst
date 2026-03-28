from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import prediction, sentiment, health, fundamentals, indicators, news, history

app = FastAPI(
    title="AI Stock Analyst — ML Service",
    description="LSTM prediction · FinBERT sentiment · Technical indicators · Fundamentals",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(history.router)
app.include_router(fundamentals.router)
app.include_router(indicators.router)
app.include_router(news.router)
app.include_router(prediction.router)
app.include_router(sentiment.router)


@app.get("/")
async def root():
    return {
        "service": "ml-service",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": [
            "GET  /health",
            "GET  /fundamentals/{ticker}",
            "GET  /indicators/{ticker}?source=local|alphavantage",
            "GET  /news/{ticker}?analyze=true",
            "GET  /predict/{ticker}?days=30",
            "POST /sentiment/{ticker}",
        ],
    }
