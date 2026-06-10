import { apiClient } from "@/services/apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_KEY = "anon.token";

/**
 * Fetch premium status for any user without side-effects (no session expiry on 401).
 * Works when the caller has admin access or is checking their own subscription.
 * Returns false silently for all other cases (403/401/network errors).
 */
export async function fetchPremiumStatusSafe(userId: string): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {};
  if (token && token !== "undefined" && token !== "null") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/user-subscriptions/user/${userId}?page=1&pageSize=10`,
      { method: "GET", headers },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { items?: Array<{ status: number; expiresAt: string }> };
    const now = new Date();
    return (data.items ?? []).some((s) => s.status === 0 && new Date(s.expiresAt) > now);
  } catch {
    return false;
  }
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationDays: number;
  features: string;
  isActive: boolean;
}

export interface PaginatedPlansResponse {
  items: SubscriptionPlan[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateOrderResponse {
  // Order identity
  orderId?: string;
  id?: string;
  orderCode?: string;
  referenceCode?: string;
  // Amount
  amount?: number;
  transferAmount?: number;
  price?: number;
  // Bank transfer info (may be null — extract from qrUrl instead)
  bankAccount?: string;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  bankCode?: string;
  // Transfer reference
  transferContent?: string;
  content?: string;
  description?: string;
  memo?: string;
  // QR / payment link — SePay uses "qrUrl"
  qrUrl?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  qrImage?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  [key: string]: unknown;
}

const BANK_NAMES: Record<string, string> = {
  TPB: "TPBank (Ngân hàng Tiên Phong)",
  VCB: "Vietcombank",
  TCB: "Techcombank",
  MB: "MB Bank",
  VPB: "VPBank",
  ACB: "ACB",
  BIDV: "BIDV",
  VTB: "Vietinbank",
  STB: "Sacombank",
  HDB: "HDBank",
  OCB: "OCB",
  MSB: "MSB",
  SHB: "SHB",
  EIB: "Eximbank",
  NAB: "Nam A Bank",
  BAB: "Bac A Bank",
  CAKE: "CAKE by VPBank",
  UBANK: "Ubank by VPBank",
};

export interface ParsedBankInfo {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
}

/** Parse SePay QR URL to extract bank info when API returns null fields */
export function parseSepayQrUrl(url: string): ParsedBankInfo | null {
  try {
    const u = new URL(url);
    const acc = u.searchParams.get("acc") ?? "";
    const bank = (u.searchParams.get("bank") ?? "").toUpperCase();
    const amount = parseInt(u.searchParams.get("amount") ?? "0", 10);
    const des = u.searchParams.get("des") ?? "";
    if (!acc) return null;
    return {
      accountNumber: acc,
      bankCode: bank,
      bankName: BANK_NAMES[bank] ?? bank,
      amount,
      transferContent: des,
      qrImageUrl: url,
    };
  } catch {
    return null;
  }
}

export interface OrderDetail extends CreateOrderResponse {
  status?: string | number;
  planName?: string;
  planId?: string;
  userId?: string;
  createdAt?: string;
  expiredAt?: string;
  paidAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  orderId: string;
  status: number;
  startedAt: string;
  expiresAt: string;
  createdAt: string;
  userName?: string | null;
  planName?: string | null;
}

// Map known feature keys → Vietnamese label builder
const FEATURE_MAP: Record<string, (v: unknown) => string | null> = {
  postLimit: (v) =>
    v === -1 || v === 0
      ? "Đăng bài không giới hạn"
      : typeof v === "number"
        ? `Tối đa ${v} bài đăng`
        : null,
  highlightPost: (v) => (v ? "Bài viết được nổi bật trên feed" : null),
  prioritySupport: (v) => (v ? "Hỗ trợ ưu tiên 24/7" : null),
  anonymousPost: (v) => (v ? "Đăng bài ẩn danh" : null),
  customAlias: (v) => (v ? "Tùy chỉnh tên ẩn danh" : null),
  premiumBadge: (v) => (v ? "Huy hiệu Premium" : null),
  badge: (v) => (v ? "Huy hiệu đặc biệt" : null),
  noAds: (v) => (v ? "Không quảng cáo" : null),
  extendedBio: (v) => (v ? "Mô tả hồ sơ mở rộng" : null),
  analytics: (v) => (v ? "Thống kê bài viết" : null),
  earlyAccess: (v) => (v ? "Truy cập sớm tính năng mới" : null),
  unlimitedFollow: (v) => (v ? "Theo dõi không giới hạn" : null),
  followLimit: (v) =>
    v === -1 || v === 0
      ? "Theo dõi không giới hạn"
      : typeof v === "number"
        ? `Theo dõi tối đa ${v} người`
        : null,
  storageLimit: (v) =>
    typeof v === "number" ? (v === -1 ? "Lưu trữ không giới hạn" : `Lưu trữ ${v} MB`) : null,
};

function featureObjectToLabels(obj: Record<string, unknown>): string[] {
  return Object.entries(obj)
    .map(([key, value]) => {
      const handler = FEATURE_MAP[key];
      if (handler) return handler(value);
      // Fallback: convert camelCase key to readable text
      if (value === false || value === null || value === undefined) return null;
      const label = key.replace(/([A-Z])/g, " $1").toLowerCase();
      if (value === true) return label.charAt(0).toUpperCase() + label.slice(1);
      return `${label.charAt(0).toUpperCase() + label.slice(1)}: ${value}`;
    })
    .filter((s): s is string => !!s);
}

function tryParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

function resolveFeatureArray(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === "string" ? item.trim() : null))
      .filter((s): s is string => !!s);
  }
  if (typeof raw === "object" && raw !== null) {
    return featureObjectToLabels(raw as Record<string, unknown>);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    let parsed: unknown = tryParseJson(trimmed);
    // Double-encoded: first parse returned a string, parse again
    if (typeof parsed === "string") parsed = tryParseJson(parsed);
    if (parsed !== undefined) return resolveFeatureArray(parsed);
  }
  return null;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await apiClient.get<unknown>(
      "/api/v1/subscription-plans?isActive=true&pageSize=50",
    );
    if (Array.isArray(res)) return res as SubscriptionPlan[];
    const obj = res as Record<string, unknown>;
    const list = obj.items ?? obj.subscriptionPlans ?? obj.plans ?? obj.data ?? obj.results ?? [];
    return (Array.isArray(list) ? list : []) as SubscriptionPlan[];
  },

  async createOrder(planId: string): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>("/api/v1/payments/create-order", { planId });
  },

  async getOrder(orderId: string): Promise<OrderDetail> {
    return apiClient.get<OrderDetail>(`/api/v1/payments/orders/${orderId}`);
  },

  async getUserSubscriptions(userId: string, page = 1, pageSize = 10) {
    return apiClient.get<{
      items: UserSubscription[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/v1/user-subscriptions/user/${userId}?page=${page}&pageSize=${pageSize}`);
  },

  async getSubscription(id: string): Promise<UserSubscription> {
    return apiClient.get<UserSubscription>(`/api/v1/user-subscriptions/${id}`);
  },

  /**
   * Public-facing peek at a user's subscription. Returns the currently active
   * subscription (status 0, not expired) if any, otherwise the most recent one,
   * or null when the user has none / the request is not permitted.
   */
  async getPublicSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const res = await this.getUserSubscriptions(userId, 1, 20);
      const items = res.items ?? [];
      if (items.length === 0) return null;
      const now = Date.now();
      const active = items.find((s) => s.status === 0 && new Date(s.expiresAt).getTime() > now);
      if (active) return active;
      // Fall back to the newest record so we can still show "expired" state.
      return [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
    } catch {
      return null;
    }
  },

  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/user-subscriptions/${id}`);
  },

  async updateSubscription(
    id: string,
    payload: { status?: number; startedAt?: string },
  ): Promise<UserSubscription> {
    return apiClient.put<UserSubscription>(`/api/v1/user-subscriptions/${id}`, payload);
  },

  /** Map numeric status to Vietnamese label + color */
  subscriptionStatusLabel(status: number, expiresAt?: string): { label: string; color: string } {
    const expired = expiresAt ? new Date(expiresAt) < new Date() : false;
    if (status === 0 && !expired) return { label: "Đang hoạt động", color: "green" };
    if (status === 0 && expired) return { label: "Hết hạn", color: "gray" };
    if (status === 1) return { label: "Hết hạn", color: "gray" };
    if (status === 2) return { label: "Đã hủy", color: "red" };
    return { label: "Không xác định", color: "gray" };
  },

  /** Days remaining until expiresAt */
  daysRemaining(expiresAt: string): number {
    const ms = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  },

  /** Extract order ID from any response shape */
  extractOrderId(order: CreateOrderResponse): string {
    const val = order.orderId ?? order.id ?? order.orderCode ?? order.referenceCode;
    return typeof val === "string" ? val : "";
  },

  /** Extract amount from any response shape */
  extractAmount(order: CreateOrderResponse, fallback: number): number {
    return (
      (typeof order.amount === "number" ? order.amount : null) ??
      (typeof order.transferAmount === "number" ? order.transferAmount : null) ??
      (typeof order.price === "number" ? order.price : null) ??
      fallback
    );
  },

  /** True if payment/subscription status means "paid/active" */
  isPaidStatus(status: unknown): boolean {
    // Numeric: 0 = Active (SubscriptionStatus enum confirmed from API), 1 also accepted
    if (status === 0 || status === 1) return true;
    if (typeof status === "string") {
      const s = status.toLowerCase();
      return ["paid", "completed", "success", "active", "approved", "confirmed", "0", "1"].includes(
        s,
      );
    }
    return false;
  },

  parseFeatures(raw: unknown): string[] {
    if (raw == null || raw === "") return [];

    const resolved = resolveFeatureArray(raw);
    if (resolved !== null) return resolved;

    // Fallback: plain text with delimiters
    if (typeof raw === "string") {
      return raw
        .split(/[;\n|]+/)
        .map((f) => f.trim())
        .filter(Boolean);
    }

    return [];
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  },
};
