import type { LeaderboardPost } from "@/types";

export function filterLeaderboardPosts(posts: LeaderboardPost[], query: string, category: string) {
  const ALL_CATEGORY = "Tất cả";
  const normalizedQuery = query.trim().toLowerCase();

  return posts.filter((post) => {
    const matchesSearch =
      !normalizedQuery ||
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.author.name.toLowerCase().includes(normalizedQuery);
    const matchesCategory = category === ALL_CATEGORY || post.category === category;
    return matchesSearch && matchesCategory;
  });
}

export const leaderboardService = {
  async getCategories(): Promise<string[]> {
    return [];
  },

  async getCurrentLeaderboard(): Promise<LeaderboardPost[]> {
    return [];
  },

  async getHistoricalLeaderboard(_month: string): Promise<LeaderboardPost[]> {
    return [];
  },

  async getAvailableMonths(): Promise<{ value: string; label: string }[]> {
    return [];
  },
};
