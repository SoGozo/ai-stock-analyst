import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <p style={{ fontSize: 64, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 8 }}>
          404
        </p>
        <p style={{ fontSize: 16, color: "#777", marginBottom: 24 }}>
          Page not found
        </p>
        <Link
          to="/"
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: "#111",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "inherit",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
