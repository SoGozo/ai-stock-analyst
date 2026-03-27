from pydantic import BaseModel
from typing import Optional


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
