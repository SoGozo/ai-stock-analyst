import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const C = {
  bg: "#f5f5f5",
  card: "#fff",
  border: "1px solid #e8e8e8",
  text: "#111",
  muted: "#777",
  ghost: "#bbb",
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAccessToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAccessToken(data.accessToken);
      setUser(data.user);
      navigate("/");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: C.bg,
    border: C.border,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    color: C.text,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    boxSizing: "border-box" as const,
  };

  return (
    <main style={{
      minHeight: "calc(100svh - 50px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 16px",
      background: C.bg,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          <div style={{
            width: 30, height: 30, background: "#111", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <polyline points="1,11 4,7 7,8.5 13,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>StockAI</span>
        </div>

        <div style={{
          background: C.card,
          border: C.border,
          borderRadius: 14,
          padding: "28px 24px",
        }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: C.text, textAlign: "center", marginBottom: 24 }}>
            Sign in
          </h1>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#bbb")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "#bbb")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e8e8e8")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                background: loading ? "#555" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                marginTop: 4,
                transition: "background 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: C.ghost, marginTop: 20 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: C.muted, fontWeight: 500, textDecoration: "none" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
