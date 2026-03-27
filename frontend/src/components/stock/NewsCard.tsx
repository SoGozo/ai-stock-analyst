import { ExternalLink } from "lucide-react";
import { NewsArticle } from "../../api/stock.api";
import { formatDistanceToNow } from "date-fns";

interface Props {
  articles: NewsArticle[];
}

export function NewsCard({ articles }: Props) {
  if (!articles.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No recent news found.</p>;
  }

  return (
    <div className="space-y-3">
      {articles.slice(0, 10).map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors group"
        >
          {article.urlToImage && (
            <img
              src={article.urlToImage}
              alt=""
              className="w-16 h-12 object-cover rounded shrink-0 bg-gray-800"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-500">{article.source}</span>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">
                {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </span>
              <ExternalLink size={10} className="text-gray-600 ml-auto shrink-0" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
