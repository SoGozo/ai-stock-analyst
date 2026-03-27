import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "../../api/ml.api";
import { formatDistanceToNow } from "date-fns";

interface Props {
  articles: NewsArticle[];
}

function SentimentBadge({ label, score }: { label?: string; score?: number }) {
  if (!label) return null;
  const styles =
    label === "Bullish"
      ? "bg-green-950/60 text-green-400 border-green-900"
      : label === "Bearish"
      ? "bg-red-950/60 text-red-400 border-red-900"
      : "bg-gray-800/60 text-gray-400 border-gray-700";
  return (
    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium shrink-0 ${styles}`}>
      {score !== undefined ? (score >= 0 ? "+" : "") + score.toFixed(2) : label}
    </span>
  );
}

export function NewsCard({ articles }: Props) {
  if (!articles.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No recent news found.</p>;
  }

  return (
    <div className="space-y-2.5">
      {articles.slice(0, 10).map((article, i) => (
        <a
          key={i}
          href={article.url === "#" ? undefined : article.url}
          target={article.url === "#" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="flex gap-3 p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors group cursor-pointer"
        >
          {article.urlToImage && (
            <img
              src={article.urlToImage}
              alt=""
              className="w-14 h-11 object-cover rounded shrink-0 bg-gray-800"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
              {article.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-500 shrink-0">{article.source}</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600 shrink-0">
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </span>
              <SentimentBadge label={article.sentimentLabel} score={article.sentimentScore} />
              {article.url !== "#" && (
                <ExternalLink size={10} className="text-gray-600 ml-auto shrink-0" />
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
