from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    redis_url: str = "redis://localhost:6379"
    news_api_key: str = ""
    model_cache_dir: str = "./saved_models"
    log_level: str = "INFO"

    # LSTM hyperparameters
    lstm_sequence_length: int = 60
    lstm_epochs: int = 50
    lstm_batch_size: int = 32

    # Cache TTLs (seconds)
    cache_prediction_ttl: int = 21600   # 6 hours
    cache_sentiment_ttl: int = 900      # 15 minutes


settings = Settings()
