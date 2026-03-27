import json
import redis.asyncio as aioredis
from core.config import settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def cache_get(key: str) -> dict | list | None:
    r = await get_redis()
    val = await r.get(key)
    return json.loads(val) if val else None


async def cache_set(key: str, value: dict | list, ttl: int) -> None:
    r = await get_redis()
    await r.setex(key, ttl, json.dumps(value))
