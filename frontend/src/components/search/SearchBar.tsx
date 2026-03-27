import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, X } from "lucide-react";
import { useSearch } from "../../hooks/useStockData";
import { useTickerStore } from "../../store/tickerStore";

interface Props {
  autoFocus?: boolean;
  onSelect?: () => void;
}

export function SearchBar({ autoFocus, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { recentSearches, pushRecentSearch, clearRecentSearches } = useTickerStore();
  const { data: results = [] } = useSearch(query);

  const showDropdown =
    focused && (query.length === 0 ? recentSearches.length > 0 : results.length > 0);

  useEffect(() => {
    setOpen(showDropdown);
  }, [showDropdown]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = useCallback(
    (ticker: string) => {
      pushRecentSearch(ticker.toUpperCase());
      setQuery("");
      setOpen(false);
      setFocused(false);
      navigate(`/stock/${ticker.toUpperCase()}`);
      onSelect?.();
    },
    [navigate, pushRecentSearch, onSelect]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-2 bg-gray-900 border rounded-lg px-3 py-2 transition-colors ${
          focused ? "border-blue-500" : "border-gray-700"
        }`}
      >
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKey}
          placeholder="Search stocks (AAPL, TSLA…)"
          className="bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none w-full"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {query.length === 0 ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock size={11} /> Recent searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((t) => (
                <button
                  key={t}
                  onClick={() => select(t)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                >
                  <Clock size={12} className="text-gray-600 shrink-0" />
                  <span className="font-mono font-semibold text-gray-300 text-sm">{t}</span>
                </button>
              ))}
            </>
          ) : (
            results.slice(0, 8).map((r) => (
              <button
                key={r.ticker}
                onClick={() => select(r.ticker)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors text-left"
              >
                <div>
                  <span className="font-mono font-semibold text-blue-400 text-sm">{r.ticker}</span>
                  <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{r.name}</p>
                </div>
                <span className="text-xs text-gray-600 shrink-0">{r.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
