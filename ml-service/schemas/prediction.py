from pydantic import BaseModel


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
    confidence: float
    trainedOn: int
