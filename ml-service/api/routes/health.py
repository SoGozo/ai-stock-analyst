import os
from fastapi import APIRouter
from core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    model_dir = settings.model_cache_dir
    trained_tickers = []
    if os.path.exists(model_dir):
        trained_tickers = [
            d for d in os.listdir(model_dir)
            if os.path.isfile(os.path.join(model_dir, d, "model.keras"))
        ]

    return {
        "status": "ok",
        "service": "ml-service",
        "modelsLoaded": trained_tickers,
    }
