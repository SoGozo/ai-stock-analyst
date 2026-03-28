import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import { StockDetail } from "./pages/StockDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Watchlist } from "./pages/Watchlist";
import { Docs } from "./pages/Docs";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const { pathname } = useLocation();
  const showNavbar = pathname !== "/" && !pathname.startsWith("/stock/") && pathname !== "/guide";
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/guide" element={<Docs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#111",
            border: "1px solid #e8e8e8",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </QueryClientProvider>
  );
}
