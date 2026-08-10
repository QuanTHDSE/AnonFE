export const TOKEN_STORAGE_KEY = "anon.token";
export const REFRESH_TOKEN_STORAGE_KEY = "anon.refreshToken";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";



export function getErrorMessage(
  err: unknown,
  defaultMessage = "Thao tác thất bại. Vui lòng thử lại.",
): string {
  if (err instanceof Error) {
    if (err.message && err.message !== "[object Object]") {
      return err.message;
    }
  }
  if (typeof err === "string" && err.trim()) {
    return err;
  }
  if (typeof err === "object" && err !== null) {
    const anyErr = err as Record<string, unknown>;
    if (typeof anyErr.message === "string" && anyErr.message !== "[object Object]") {
      return anyErr.message;
    }
    if (typeof anyErr.error === "string" && anyErr.error !== "[object Object]") {
      return anyErr.error;
    }
  }
  return defaultMessage;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token && token !== "undefined" && token !== "null"
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as {
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      refresh_token?: string;
    };
    const newToken = data.token ?? data.accessToken;
    if (!newToken) return false;

    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    const newRefreshToken = data.refreshToken ?? data.refresh_token;
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
    }
    return true;
  } catch {
    return false;
  }
}

async function extractErrorMessage(res: Response): Promise<string> {
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return "Máy chủ Render đang khởi động (cold start) hoặc bị quá tải. Vui lòng đợi khoảng 15-30 giây và thử lại.";
  }

  try {
    const body = (await res.json()) as Record<string, unknown>;
    if (body && typeof body === "object") {
      // 1. ASP.NET Core ModelState validation errors: { errors: { field: ["msg"] } }
      if (body.errors && typeof body.errors === "object") {
        const msgs = Object.values(body.errors).flat();
        const valid = msgs.filter((m): m is string => typeof m === "string" && Boolean(m.trim()));
        if (valid.length > 0) return valid.join(", ");
      }

      // 2. Custom ExceptionMiddleware format: { status: 400, error: { code: "...", message: "..." } }
      if (
        body.error &&
        typeof body.error === "object" &&
        typeof (body.error as Record<string, unknown>).message === "string"
      ) {
        return (body.error as Record<string, unknown>).message as string;
      }

      // 3. Simple message property (string or array)
      if (Array.isArray(body.message)) {
        const valid = body.message.filter((m): m is string => typeof m === "string" && Boolean(m.trim()));
        if (valid.length > 0) return valid.join(", ");
      }
      if (typeof body.message === "string" && body.message.trim()) {
        return body.message;
      }

      // 4. Simple error property (string)
      if (typeof body.error === "string" && body.error.trim()) {
        return body.error;
      }

      // 5. Problem Details / standard API properties
      if (typeof body.detail === "string" && body.detail.trim()) {
        return body.detail;
      }
      if (typeof body.title === "string" && body.title.trim()) {
        return body.title;
      }
    }
  } catch {
    // Non-JSON response body (e.g. raw HTML from proxy)
  }

  return `Yêu cầu thất bại (Mã lỗi HTTP ${res.status})`;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, options?: RequestInit, skipRefresh = false): Promise<T> {
  let attempts = 0;

  while (true) {
    attempts++;
    let res: Response;

    try {
      const isFormData = options?.body instanceof FormData;
      const buildHeaders = () => ({
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...getAuthHeaders(),
        ...options?.headers,
      });

      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(),
      });
    } catch {
      if (attempts <= MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw new Error(
        "Không thể kết nối đến máy chủ. Máy chủ Render có thể đang trong quá trình khởi động, vui lòng thử lại sau vài giây.",
      );
    }

    if ((res.status === 502 || res.status === 503 || res.status === 504) && attempts <= MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS);
      continue;
    }

    const isAuthEndpoint = path.startsWith("/api/v1/auth/");

    if (res.status === 401 && !skipRefresh && !isAuthEndpoint) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(path, options, true);
      }

      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      window.dispatchEvent(new Event("auth:session-expired"));
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (res.status === 403) {
      const detail = await extractErrorMessage(res);
      const generic =
        "Không có quyền thực hiện thao tác này. Token hiện tại chưa có quyền phù hợp — " +
        "hãy đăng xuất và đăng nhập lại sau khi được cấp quyền.";
      throw new Error(detail && !detail.startsWith("Yêu cầu thất bại") ? detail : generic);
    }

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }

    const contentType = res.headers.get("content-type");
    if (res.status === 204 || !contentType || !contentType.includes("application/json")) {
      return undefined as unknown as T;
    }

    return res.json() as Promise<T>;
  }
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
  postForm<T>(path: string, body: FormData): Promise<T> {
    return request<T>(path, { method: "POST", body });
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
  },
  putForm<T>(path: string, body: FormData): Promise<T> {
    return request<T>(path, { method: "PUT", body });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patchForm<T>(path: string, body: FormData): Promise<T> {
    return request<T>(path, { method: "PATCH", body });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};

