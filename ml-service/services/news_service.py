"""
NewsAPI fetcher — headlines by ticker symbol.
Returns articles with title, description, url, source, publishedAt.
"""
import httpx
from core.config import settings

NEWSAPI_BASE = "https://newsapi.org/v2/everything"

# Financial news domains most likely to have relevant stock articles
FINANCIAL_DOMAINS = (
    "reuters.com,bloomberg.com,cnbc.com,wsj.com,"
    "marketwatch.com,finance.yahoo.com,seekingalpha.com,"
    "fool.com,barrons.com,ft.com,investopedia.com"
)


async def fetch_stock_news(ticker: str, company_name: str | None = None, page_size: int = 30) -> list[dict]:
    """
    Fetch recent news articles for a stock ticker.
    Uses ticker + company name for broader coverage.
    """
    query = f'"{ticker}"'
    if company_name:
        # Search by company name too, but cap to avoid overly broad results
        short_name = " ".join(company_name.split()[:3])
        query = f'"{ticker}" OR "{short_name}"'

    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
        "domains": FINANCIAL_DOMAINS,
        "apiKey": settings.news_api_key,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(NEWSAPI_BASE, params=params)
        res.raise_for_status()
        data = res.json()

    if data.get("status") != "ok":
        raise RuntimeError(f"NewsAPI error: {data.get('message', 'unknown error')}")

    articles = []
    for a in data.get("articles", []):
        if not a.get("title") or not a.get("url"):
            continue
        articles.append({
            "title": a["title"],
            "description": a.get("description"),
            "url": a["url"],
            "source": a.get("source", {}).get("name", "Unknown"),
            "publishedAt": a.get("publishedAt"),
            "urlToImage": a.get("urlToImage"),
        })

    return articles
