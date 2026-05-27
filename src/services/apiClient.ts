export const TOKEN_STORAGE_KEY = "anon.token";
export const REFRESH_TOKEN_STORAGE_KEY = "anon.refreshToken";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) return false;

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;

  const data = (await res.json()) as { token?: string; refreshToken?: string };
  if (!data.token) return false;

  localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
  }
  return true;
}

async function extractErrorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({})) as {
    message?: string | string[];
    error?: string;
  };
  if (Array.isArray(body.message)) return body.message.join(", ");
  return body.message ?? body.error ?? `HTTP ${res.status}`;
}

async function request<T>(path: string, options?: RequestInit, skipRefresh = false): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const buildHeaders = () => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...getAuthHeaders(),
    ...options?.headers,
  });

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(),
  });

  const isAuthEndpoint = path.startsWith("/api/v1/auth/");

  if (res.status === 401 && !skipRefresh && !isAuthEndpoint) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(),
      });
      if (!retryRes.ok) {
        throw new Error(await extractErrorMessage(retryRes));
      }
      return retryRes.json() as Promise<T>;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event("auth:session-expired"));
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },
  putForm<T>(path: string, body: FormData): Promise<T> {
    return request<T>(path, { method: "PUT", body });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
