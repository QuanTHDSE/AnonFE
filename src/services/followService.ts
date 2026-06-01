import { apiClient } from "@/services/apiClient";

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowUserItem {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

interface RawFollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  follower: FollowUserItem;
  following: FollowUserItem;
  createdAt: string;
}

interface RawFollowListResponse {
  data: RawFollowRelation[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedFollowUsersResponse {
  data: FollowUserItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const followService = {
  async follow(followingId: string): Promise<void> {
    await apiClient.post("/api/v1/follows", { followingId });
  },

  async unfollow(followingId: string): Promise<void> {
    await apiClient.delete(`/api/v1/follows/${followingId}`);
  },

  async getStats(userId: string): Promise<FollowStats> {
    return apiClient.get<FollowStats>(`/api/v1/follows/stats/${userId}`);
  },

  async isFollowing(followingId: string): Promise<boolean> {
    return apiClient.get<boolean>(`/api/v1/follows/is-following/${followingId}`);
  },

  async getFollowers(userId: string, page = 1, pageSize = 20): Promise<PaginatedFollowUsersResponse> {
    const raw = await apiClient.get<RawFollowListResponse>(
      `/api/v1/follows/followers/${userId}?page=${page}&pageSize=${pageSize}`,
    );
    return { ...raw, data: raw.data.map((item) => item.follower) };
  },

  async getFollowing(userId: string, page = 1, pageSize = 20): Promise<PaginatedFollowUsersResponse> {
    const raw = await apiClient.get<RawFollowListResponse>(
      `/api/v1/follows/following/${userId}?page=${page}&pageSize=${pageSize}`,
    );
    return { ...raw, data: raw.data.map((item) => item.following) };
  },
};
