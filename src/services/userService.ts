import { apiClient } from "@/services/apiClient";
import { fetchPremiumStatusSafe } from "@/services/subscriptionService";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  anonAlias: string;
  anonImageId?: string | null;
  anonImageUrl?: string | null;
  role: string;
  createdAt: string;
  isPremium?: boolean;
  isAnonDefault?: boolean;
}

export interface TopContributor {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  isAnonymous: boolean;
  postsCount: number;
  commentsCount: number;
  upvotesReceived: number;
  averageRating: number;
  contributionScore: number;
}

export interface TopContributorsResponse {
  month: number;
  year: number;
  contributors: TopContributor[];
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

  async getTopContributors(
    limit = 5,
    month?: number,
    year?: number,
  ): Promise<TopContributorsResponse> {
    const query = new URLSearchParams();
    query.set("limit", String(limit));
    if (month) query.set("month", String(month));
    if (year) query.set("year", String(year));
    return apiClient.get<TopContributorsResponse>(
      `/api/v1/users/top-contributors?${query.toString()}`,
    );
  },

  // PUT /api/v1/users/me accepts Username, Bio, Avatar and AnonAlias (multipart).
  async updateMe(payload: UpdateUserPayload): Promise<UserProfile> {
    const form = new FormData();
    if (payload.username != null) form.append("Username", payload.username);
    if (payload.bio != null) form.append("Bio", payload.bio);
    if (payload.avatarFile) form.append("Avatar", payload.avatarFile);
    if (payload.anonAlias != null) form.append("AnonAlias", payload.anonAlias);
    return apiClient.putForm<UserProfile>("/api/v1/users/me", form);
  },

  // PATCH /api/v1/users/me/anon flips IsAnonDefault on the server (a toggle —
  // it takes no parameters). Call it only when the desired value differs from
  // the current one.
  async toggleAnonDefault(): Promise<void> {
    await apiClient.patch("/api/v1/users/me/anon");
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

// --- Author info cache -------------------------------------------------------
// The posts/comments APIs don't return author avatars or premium status, so we
// fetch the full profile from GET /api/v1/users/{id} once per author and reuse
// it for both avatar and premium lookups across many feed cards.
const userCache = new Map<string, UserProfile | null>();
const userInflight = new Map<string, Promise<UserProfile | null>>();

async function fetchUserCached(id: string): Promise<UserProfile | null> {
  if (!id) return null;
  if (userCache.has(id)) return userCache.get(id) ?? null;
  const existing = userInflight.get(id);
  if (existing) return existing;
  const promise = userService
    .getUserById(id)
    .then((u) => {
      userCache.set(id, u);
      userInflight.delete(id);
      return u;
    })
    .catch(() => {
      userCache.set(id, null);
      userInflight.delete(id);
      return null;
    });
  userInflight.set(id, promise);
  return promise;
}

export async function getUserAvatar(id: string): Promise<string | null> {
  const u = await fetchUserCached(id);
  return u?.avatarUrl ?? null;
}

// Premium status is resolved best-effort from two sources: the user profile's
// `isPremium` flag (if the backend includes it), falling back to the user's
// subscription list. Cached so each author is checked at most once per session.
const premiumCache = new Map<string, boolean>();
const premiumInflight = new Map<string, Promise<boolean>>();

export async function getUserPremium(id: string): Promise<boolean> {
  if (!id) return false;
  if (premiumCache.has(id)) return premiumCache.get(id) ?? false;
  const existing = premiumInflight.get(id);
  if (existing) return existing;
  const promise = (async () => {
    const u = await fetchUserCached(id);
    let premium = u?.isPremium === true;
    if (!premium) premium = await fetchPremiumStatusSafe(id);
    premiumCache.set(id, premium);
    premiumInflight.delete(id);
    return premium;
  })();
  premiumInflight.set(id, promise);
  return promise;
}
