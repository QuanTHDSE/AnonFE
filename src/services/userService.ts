import { apiClient } from "@/services/apiClient";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  anonAlias: string;
  role: string;
  createdAt: string;
}

export interface UpdateUserPayload {
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  anonAlias?: string | null;
  isAnonDefault?: boolean | null;
}

export interface PaginatedUsersResponse {
  users: UserProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/api/v1/users/me");
  },

  async getUserById(id: string): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/api/v1/users/${id}`);
  },

  async getUsers(page = 1, pageSize = 10): Promise<PaginatedUsersResponse> {
    return apiClient.get<PaginatedUsersResponse>(`/api/v1/users?page=${page}&pageSize=${pageSize}`);
  },

  async updateMe(payload: UpdateUserPayload): Promise<UserProfile> {
    return apiClient.put<UserProfile>("/api/v1/users/me", payload);
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/api/v1/users/${id}`, payload);
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${id}`);
  },
};
