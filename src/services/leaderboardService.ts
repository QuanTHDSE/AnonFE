import type { FeedPostItem, LeaderboardPost } from "@/types";
import { postService } from "@/services/postService";

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

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return `${Math.floor(days / 7)} tuần trước`;
}

function toLeaderboardPost(post: FeedPostItem, index: number): LeaderboardPost {
  return {
    id: post.id,
    rank: index + 1,
    title: post.title,
    image: post.images?.[0] ?? "",
    author: {
      name: post.isAnonymous
        ? (post.author?.name ?? "Ẩn danh")
        : (post.author?.name ?? "Người dùng"),
      // `author.avatar` is the anon image for anon posts, real avatar otherwise
      // (populated from the API's `authorAvatarUrl`).
      avatar: post.author?.avatar ?? "",
    },
    likes: post.likesCount,
    comments: post.commentsCount,
    timeAgo: relativeTime(post.createdAt),
    trend: "same",
    category: post.subject?.name ?? "Khác",
  };
}

export const leaderboardService = {
  async getCategories(): Promise<string[]> {
    try {
      const res = await postService.getSubjects({ pageSize: 100 });
      return ["Tất cả", ...res.subjects.map((s) => s.name).filter(Boolean)];
    } catch {
      return ["Tất cả"];
    }
  },

  async getCurrentLeaderboard(): Promise<LeaderboardPost[]> {
    try {
      const posts = await postService.getTopPosts({ range: "30d", sort: "hot", pageSize: 30 });
      return posts.map(toLeaderboardPost);
    } catch {
      return [];
    }
  },
};
