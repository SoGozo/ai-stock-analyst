import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, BookMarked, LogOut, User } from "lucide-react";
import { SearchBar } from "../search/SearchBar";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <TrendingUp size={20} className="text-blue-400" />
          <span className="font-semibold text-sm text-white hidden sm:block">StockAI</span>
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {user ? (
            <>
              <Link
                to="/watchlist"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title="Watchlist"
              >
                <BookMarked size={18} />
              </Link>
              <div className="flex items-center gap-1 ml-1">
                <span className="text-xs text-gray-500 hidden md:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <User size={14} />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
