import { apiClient } from "./client";

interface AuthResponse {
  data: {
    accessToken: string;
    user: { id: string; email: string; name: string };
  };
}

export const authApi = {
  register: (email: string, name: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/register", { email, name, password }).then((r) => r.data.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data.data),

  logout: () => apiClient.post("/auth/logout"),

  me: () =>
    apiClient.get<{ data: { id: string; email: string; name: string } }>("/auth/me").then((r) => r.data.data),
};
