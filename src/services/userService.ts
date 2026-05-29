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

export const userService = {
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/api/v1/users/me");
  },
};
