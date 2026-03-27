import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trash2, TrendingUp } from "lucide-react";
import { watchlistApi } from "../api/watchlist.api";
import { useAuthStore } from "../store/authStore";
import { Skeleton } from "../components/ui/Skeleton";
import toast from "react-hot-toast";

export function Watchlist() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistApi.get,
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (ticker: string) => watchlistApi.remove(ticker),
    onSuccess: (_, ticker) => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${ticker} removed from watchlist`);
    },
  });

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Sign in to use your watchlist</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-500 transition-colors"
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">Watchlist</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-gray-800 rounded-xl">
          <TrendingUp size={32} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-400 text-sm">No tickers in your watchlist yet.</p>
          <p className="text-gray-600 text-xs mt-1">Search for a stock and add it.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
            >
              <button
                onClick={() => navigate(`/stock/${entry.ticker}`)}
                className="font-mono font-semibold text-blue-400 hover:text-blue-300 text-sm"
              >
                {entry.ticker}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">
                  Added {new Date(entry.added_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => removeMutation.mutate(entry.ticker)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
