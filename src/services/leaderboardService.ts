import {
  availableLeaderboardMonths,
  historicalLeaderboardPosts,
  leaderboardCategories,
  leaderboardPosts,
} from "@/mocks/content";
import type { LeaderboardPost } from "@/types";

const ALL_CATEGORY = "Tất cả";
const clone = <T>(value: T): T => structuredClone(value);

export function filterLeaderboardPosts(posts: LeaderboardPost[], query: string, category: string) {
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
  async getCategories() {
    return clone(leaderboardCategories);
  },

  async getCurrentLeaderboard() {
    return clone(leaderboardPosts);
  },

  async getHistoricalLeaderboard(month: string) {
    return clone(historicalLeaderboardPosts[month] ?? []);
  },

  async getAvailableMonths() {
    return clone(availableLeaderboardMonths);
  },
};
