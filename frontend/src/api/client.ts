import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  timeout: 30000,
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;
    if (error.response?.status !== 401 || originalReq._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalReq.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalReq);
      });
    }

    originalReq._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
      const newToken = res.data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      pendingQueue.forEach((q) => q.resolve(newToken));
      pendingQueue = [];
      originalReq.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalReq);
    } catch (err) {
      pendingQueue.forEach((q) => q.reject(err));
      pendingQueue = [];
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
