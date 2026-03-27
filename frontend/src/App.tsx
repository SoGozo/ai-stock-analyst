import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/layout/Navbar";
// @ts-ignore
import Dashboard from "./pages/Dashboard";
import { StockDetail } from "./pages/StockDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Watchlist } from "./pages/Watchlist";

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
  const showNavbar = pathname !== "/";
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock/:ticker" element={<StockDetail />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid #374151",
            fontSize: "13px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
