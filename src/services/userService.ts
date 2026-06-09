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
  isPremium?: boolean;
}

export interface UpdateUserPayload {
  username?: string | null;
  bio?: string | null;
  avatarFile?: File | null;
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
    const form = new FormData();
    if (payload.username != null) form.append("Username", payload.username);
    if (payload.bio != null) form.append("Bio", payload.bio);
    if (payload.avatarFile) form.append("Avatar", payload.avatarFile);
    if (payload.anonAlias != null) form.append("AnonAlias", payload.anonAlias);
    if (payload.isAnonDefault != null) form.append("IsAnonDefault", String(payload.isAnonDefault));
    return apiClient.putForm<UserProfile>("/api/v1/users/me", form);
  },

  async updateUser(
    id: string,
    payload: Omit<UpdateUserPayload, "avatarFile">,
  ): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/api/v1/users/${id}`, payload);
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${id}`);
  },
};

// --- Author avatar cache -----------------------------------------------------
// The posts/comments APIs don't return author avatars, so we fetch them from
// GET /api/v1/users/{id} and cache the result to avoid duplicate requests when
// the same author appears across many cards.
const avatarCache = new Map<string, string | null>();
const avatarInflight = new Map<string, Promise<string | null>>();

export async function getUserAvatar(id: string): Promise<string | null> {
  if (!id) return null;
  if (avatarCache.has(id)) return avatarCache.get(id) ?? null;
  const existing = avatarInflight.get(id);
  if (existing) return existing;
  const promise = userService
    .getUserById(id)
    .then((u) => {
      const avatar = u.avatarUrl ?? null;
      avatarCache.set(id, avatar);
      avatarInflight.delete(id);
      return avatar;
    })
    .catch(() => {
      avatarCache.set(id, null);
      avatarInflight.delete(id);
      return null;
    });
  avatarInflight.set(id, promise);
  return promise;
}
