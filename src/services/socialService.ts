import type { FollowingUser } from "@/types";

export function filterFollowingUsers(users: FollowingUser[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return users;
  }

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.username.toLowerCase().includes(normalizedQuery),
  );
}

export const socialService = {
  async getFollowingUsers(): Promise<FollowingUser[]> {
    return [];
  },
};
