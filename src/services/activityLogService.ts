import { apiClient } from "@/services/apiClient";

export interface ActivityLogItem {
  id: string;
  userId?: string | null;
  userUsername?: string | null;
  action: string;
  actionCategory: string;
  description: string;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  detailsJson?: string | null;
  createdAt: string;
}

export interface ActivityLogListResponse {
  logs: ActivityLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetActivityLogsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  category?: string;
  search?: string;
}

export const activityLogService = {
  /**
   * Fetch paginated & filtered user activity logs for Admin
   */
  getActivityLogs: async (params?: GetActivityLogsParams): Promise<ActivityLogListResponse> => {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("pageSize", String(params?.pageSize ?? 20));
    if (params?.userId) query.set("userId", params.userId);
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);

    return apiClient.get<ActivityLogListResponse>(`/api/v1/admin/activity-logs?${query.toString()}`);
  },
};
