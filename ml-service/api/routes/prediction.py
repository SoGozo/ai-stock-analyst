from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/predict", tags=["prediction"])


class PredictionPoint(BaseModel):
    date: str
    price: float
    lower: float
    upper: float


class PredictionResponse(BaseModel):
    ticker: str
    predictions: list[PredictionPoint]
    mape: float
    rmse: float
    mae: float
    r2: float
    confidence: float
    trainedOn: int
    epochsRun: int
    cached: Optional[bool] = None


@router.get("/{ticker}", response_model=PredictionResponse)
async def get_prediction(
    ticker: str,
    days: int = Query(default=30, ge=7, le=90),
    refresh: bool = Query(default=False, description="Force retrain — ignores cache"),
):
    """
    LSTM price prediction. Loads saved model.h5 from saved_models/{ticker}/.
    Trains on-demand if no saved model exists (takes ~30-60s on first call).
    Cached in Redis for 1hr to avoid recompute on every request.
    """
    ticker = ticker.upper()
    cache_key = f"pred:{ticker}:{days}d"

    if not refresh:
        cached = await cache_get(cache_key)
        if cached:
            return {**cached, "cached": True}

    try:
        from models.lstm.predictor import predict
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    import asyncio
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, predict, ticker, days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    await cache_set(cache_key, result, settings.cache_prediction_ttl)
    return {**result, "cached": False}
