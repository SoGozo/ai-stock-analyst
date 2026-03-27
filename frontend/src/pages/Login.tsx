import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

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

  return (
    <main className="min-h-[calc(100svh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp size={24} className="text-blue-400" />
          <span className="font-bold text-xl">StockAI</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h1 className="text-lg font-semibold text-center">Sign in</h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
