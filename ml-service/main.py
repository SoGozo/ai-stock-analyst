from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import prediction, sentiment, health

app = FastAPI(
    title="AI Stock Analyst — ML Service",
    description="LSTM price prediction + FinBERT sentiment analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(sentiment.router)


@app.get("/")
async def root():
    return {"service": "ml-service", "docs": "/docs"}
