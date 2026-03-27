import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { stockApi, SearchResult } from "../../api/stock.api";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { data: results = [] } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => stockApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 60000,
  });

  useEffect(() => {
    setOpen(results.length > 0 && query.length > 0);
  }, [results, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (r: SearchResult) => {
    setQuery("");
    setOpen(false);
    navigate(`/stock/${r.ticker}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (AAPL, TSLA...)"
          className="bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none w-full"
        />
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {results.slice(0, 8).map((r) => (
            <button
              key={r.ticker}
              onClick={() => select(r)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors text-left"
            >
              <div>
                <span className="font-mono font-semibold text-blue-400 text-sm">{r.ticker}</span>
                <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{r.name}</p>
              </div>
              <span className="text-xs text-gray-600">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
