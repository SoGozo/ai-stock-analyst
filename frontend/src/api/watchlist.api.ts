import { apiClient } from "./client";

interface WatchlistEntry {
  id: string;
  ticker: string;
  added_at: string;
}

export const watchlistApi = {
  get: () => apiClient.get<{ data: WatchlistEntry[] }>("/watchlist").then((r) => r.data.data),
  add: (ticker: string) => apiClient.post<{ data: WatchlistEntry }>("/watchlist", { ticker }).then((r) => r.data.data),
  remove: (ticker: string) => apiClient.delete(`/watchlist/${ticker}`),
};
