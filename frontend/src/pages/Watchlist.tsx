import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { watchlistApi } from "../api/watchlist.api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const C = {
  bg: "#f5f5f5",
  card: "#fff",
  border: "1px solid #e8e8e8",
  text: "#111",
  muted: "#777",
  ghost: "#bbb",
  red: "#b83232",
};

function Skel({ h = 56 }: { h?: number }) {
  return (
    <div style={{
      height: h, borderRadius: 10,
      background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

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
      <main style={{
        minHeight: "calc(100svh - 50px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        fontFamily: "Inter, sans-serif",
        padding: "0 16px",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>Sign in to use your watchlist</p>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "9px 20px",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <main style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "Inter, sans-serif",
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 24 }}>Watchlist</h1>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skel key={i} />)}
          </div>
        ) : entries.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "48px 24px",
            background: C.card,
            border: C.border,
            borderRadius: 12,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: "block", margin: "0 auto 12px" }}>
              <polyline points="3,17 7,12 11,14 17,6 21,9" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: 14, color: C.muted }}>No tickers in your watchlist yet.</p>
            <p style={{ fontSize: 12, color: C.ghost, marginTop: 4 }}>Search for a stock and add it.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: C.card,
                  border: C.border,
                  borderRadius: 10,
                }}
              >
                <button
                  onClick={() => navigate(`/stock/${entry.ticker}`)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: "inherit",
                    fontVariantNumeric: "tabular-nums",
                    padding: 0,
                  }}
                >
                  {entry.ticker}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: C.ghost }}>
                    Added {new Date(entry.added_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => removeMutation.mutate(entry.ticker)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      color: C.ghost,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.ghost)}
                    title="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
