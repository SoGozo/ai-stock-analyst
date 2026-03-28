import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useTickerStore } from "../../store/tickerStore";
import { authApi } from "../../api/auth.api";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { isDemoMode, setDemoMode } = useTickerStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "#fff", borderBottom: "1px solid #e8e8e8",
      height: 50, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 12,
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{
          width: 28, height: 28, background: "#111", borderRadius: 7,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <polyline points="1,11 4,7 7,8.5 13,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>StockAI</span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Guide */}
      <Link
        to="/guide"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 12px", borderRadius: 8,
          border: "1px solid #e8e8e8", background: "#fff",
          fontSize: 12, fontWeight: 500, color: "#555",
          textDecoration: "none", fontFamily: "inherit",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 3h4.5c1 0 1.5.5 1.5 1.5v9S7 12 5.5 12H2V3z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round"/>
          <path d="M14 3H9.5C8.5 3 8 3.5 8 4.5v9s1-1.5 2.5-1.5H14V3z" stroke="#555" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
        Guide
      </Link>

      {/* Demo toggle */}
      <button
        onClick={() => setDemoMode(!isDemoMode)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 20,
          border: "1px solid #e8e8e8", background: "#f5f5f5",
          fontSize: 12, color: "#555", cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: isDemoMode ? "#888" : "#2d7a2d",
        }} />
        {isDemoMode ? "Demo mode" : "Live mode"}
      </button>

      {/* Auth */}
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#777" }}>{user.name}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "5px 12px", borderRadius: 8,
              border: "1px solid #e8e8e8", background: "#fff",
              fontSize: 12, color: "#555", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          style={{
            padding: "5px 14px", borderRadius: 8,
            background: "#111", color: "#fff",
            fontSize: 12, fontWeight: 600,
            textDecoration: "none", fontFamily: "inherit",
          }}
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}
