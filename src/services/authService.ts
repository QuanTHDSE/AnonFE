import type { User, UserRole } from "@/types";
import { apiClient, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "@/services/apiClient";

export const USER_STORAGE_KEY = "anon.user";
const USERNAME_MAP_KEY = "anon.usernames";
const ADMIN_EMAILS = ["admin@anon.com", "tranhuudangquan123@gmail.com"];

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
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  refresh_token?: string;
  userId?: string;
  user?: {
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    anonAlias?: string;
  };
}

function extractToken(response: AuthResponse): string {
  return response.token ?? response.accessToken ?? "";
}

function extractRefreshToken(response: AuthResponse): string | undefined {
  return response.refreshToken ?? response.refresh_token;
}

function readUsernameMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(USERNAME_MAP_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function saveUsernameForEmail(email: string, username: string): void {
  const map = readUsernameMap();
  map[email] = username;
  localStorage.setItem(USERNAME_MAP_KEY, JSON.stringify(map));
}

function getUsernameByEmail(email: string): string | undefined {
  return readUsernameMap()[email] || undefined;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function getRoleFromJwt(jwt: Record<string, unknown>): string | undefined {
  const candidates = [
    jwt["role"],
    jwt["roles"],
    jwt["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c.toLowerCase();
    if (Array.isArray(c)) {
      const first = c.find((v) => typeof v === "string");
      if (first) return (first as string).toLowerCase();
    }
  }
  return undefined;
}

function createUserFromResponse(
  response: AuthResponse,
  fallbackEmail?: string,
  fallbackName?: string,
): User {
  const jwt = decodeJwtPayload(extractToken(response));

  const name =
    str(fallbackName) ??
    str(response.user?.username) ??
    str(response.user?.name) ??
    str(jwt["username"]) ??
    str(jwt["name"]) ??
    str(jwt["preferred_username"]) ??
    (str(jwt["sub"]) && !String(jwt["sub"]).includes("@") ? str(jwt["sub"]) : undefined) ??
    str(response.user?.email)?.split("@")[0] ??
    str(jwt["email"])?.split("@")[0] ??
    fallbackEmail?.split("@")[0] ??
    "User";

  const email = str(response.user?.email) ?? str(jwt["email"]) ?? fallbackEmail ?? "";

  const id = str(response.userId) ?? str(response.user?.id) ?? str(jwt["sub"]) ?? "";

  const jwtRole = getRoleFromJwt(jwt);
  const role: UserRole =
    jwtRole === "admin" || ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

  return { id, email, name, role };
}

function storeAuthResponse(
  response: AuthResponse,
  fallbackEmail?: string,
  fallbackName?: string,
): User {
  const token = extractToken(response);
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  const refreshToken = extractRefreshToken(response);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  const user = createUserFromResponse(response, fallbackEmail, fallbackName);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  async loginWithGoogle(idToken: string, anonAlias: string): Promise<User> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/google", {
      idToken,
      anonAlias,
    });
    return storeAuthResponse(response);
  },

  async verifyEmail(email: string, token: string): Promise<void> {
    await apiClient.post("/api/v1/auth/verify-email", { email, token });
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
    const storedUsername = getUsernameByEmail(payload.email);
    return storeAuthResponse(response, payload.email, storedUsername);
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", payload);
    saveUsernameForEmail(payload.email, payload.username);
    if (extractToken(response)) {
      storeAuthResponse(response, payload.email, payload.username);
    }
    return response;
  },

  async refresh(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error("Không có refresh token.");
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", { refreshToken });
    const existingUser = this.getCurrentUser();
    const storedUsername = existingUser?.email ? getUsernameByEmail(existingUser.email) : undefined;
    storeAuthResponse(response, existingUser?.email, storedUsername ?? existingUser?.name);
  },

  async logout(): Promise<void> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && refreshToken) {
      await apiClient.post("/api/v1/auth/logout", { accessToken, refreshToken }).catch(() => {});
    }

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  },
};
