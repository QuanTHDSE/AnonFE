import type { User } from "@/types";
import { apiClient, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "@/services/apiClient";

export const USER_STORAGE_KEY = "anon.user";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  anonAlias: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    anonAlias?: string;
  };
}

function createUserFromResponse(response: AuthResponse, fallbackEmail?: string): User {
  return {
    email: response.user?.email ?? fallbackEmail ?? "",
    name: response.user?.username ?? response.user?.email?.split("@")[0] ?? "User",
  };
}

function storeAuthResponse(response: AuthResponse, fallbackEmail?: string): User {
  localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  if (response.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);
  }
  const user = createUserFromResponse(response, fallbackEmail);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  async login(payload: LoginPayload): Promise<User> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", payload);
    return storeAuthResponse(response, payload.email);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", payload);
    if (response.token) {
      storeAuthResponse(response, payload.email);
    }
    return response;
  },

  async refresh(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("Không có refresh token.");
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", { refreshToken });
    storeAuthResponse(response);
  },

  async logout(): Promise<void> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && refreshToken) {
      await apiClient
        .post("/api/v1/auth/logout", { accessToken, refreshToken })
        .catch(() => { });
    }

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  },
};
