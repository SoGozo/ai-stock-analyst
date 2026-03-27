from fastapi import APIRouter, HTTPException, Query
from schemas.prediction import PredictionResponse
from core.cache import cache_get, cache_set
from core.config import settings

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.get("/{ticker}", response_model=PredictionResponse)
async def get_prediction(ticker: str, days: int = Query(default=30, ge=7, le=90)):
    ticker = ticker.upper()
    cache_key = f"pred:{ticker}:{days}d"

    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Lazy import — predict.py imports TF which may not be installed on Python 3.14
    try:
        from models.lstm.predictor import predict
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"LSTM model unavailable: {str(e)}. TensorFlow requires Python <=3.12."
        )

    try:
        result = predict(ticker, days)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    await cache_set(cache_key, result, settings.cache_prediction_ttl)
    return result
