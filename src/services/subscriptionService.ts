import { apiClient } from "@/services/apiClient";

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
  orderId?: string;
  id?: string;
  amount?: number;
  transferContent?: string;
  content?: string;
  bankAccount?: string;
  accountNumber?: string;
  bankName?: string;
  accountName?: string;
  qrCode?: string;
  paymentUrl?: string;
  [key: string]: unknown;
}

export interface OrderDetail extends CreateOrderResponse {
  status?: string | number;
  planName?: string;
  createdAt?: string;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await apiClient.get<PaginatedPlansResponse>(
      "/api/v1/subscription-plans?isActive=true&pageSize=50",
    );
    return res.items ?? [];
  },

  async createOrder(planId: string): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>("/api/v1/payments/create-order", { planId });
  },

  async getOrder(orderId: string): Promise<OrderDetail> {
    return apiClient.get<OrderDetail>(`/api/v1/payments/orders/${orderId}`);
  },

  parseFeatures(features: string): string[] {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // not JSON
    }
    return features
      .split(/[;\n|]+/)
      .map((f) => f.trim())
      .filter(Boolean);
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  },
};
