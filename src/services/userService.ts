import { apiClient } from "@/services/apiClient";
import { searchService } from "@/services/searchService";
import { fetchPremiumStatusSafe } from "@/services/subscriptionService";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";

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
    await apiClient.delete(`/api/v1/users/${id}/permanent`);
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
  return toAbsoluteMediaUrl(u?.avatarUrl);
}

// Public profile responses currently omit premium status, while the public user
// search response exposes `hasActiveSubscription`. Prefer that public source so
// badges also work when viewing other users; use the protected subscription
// endpoint only when public resolution is unavailable.
const PREMIUM_CACHE_TTL_MS = 5 * 60 * 1000;
const premiumCache = new Map<string, { value: boolean; expiresAt: number }>();
const premiumInflight = new Map<string, Promise<boolean>>();

export async function getUserPremium(id: string, username?: string | null): Promise<boolean> {
  if (!id) return false;
  const cached = premiumCache.get(id);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const existing = premiumInflight.get(id);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const profile = await fetchUserCached(id);
      let premium = profile?.isPremium === true;
      let publicStatusResolved = false;
      const searchName = username?.trim() || profile?.username?.trim();

      if (!premium && searchName) {
        try {
          const result = await searchService.searchUsers(searchName, 1, 20);
          const exactUser = result.users.find((user) => user.id === id);
          if (exactUser) {
            premium = exactUser.hasActiveSubscription;
            publicStatusResolved = true;
          }
        } catch {
          // Fall through to the subscription endpoint when public search fails.
        }
      }

      if (!premium && !publicStatusResolved) {
        premium = await fetchPremiumStatusSafe(id);
      }

      premiumCache.set(id, {
        value: premium,
        expiresAt: Date.now() + PREMIUM_CACHE_TTL_MS,
      });
      return premium;
    } finally {
      premiumInflight.delete(id);
    }
  })();
  premiumInflight.set(id, promise);
  return promise;
}
