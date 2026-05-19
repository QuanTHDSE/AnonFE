import { createPostCategories, feedPosts, feedTrends, savedPosts } from "@/mocks/content";
import type { SavedPost } from "@/types";

const clone = <T>(value: T): T => structuredClone(value);

export function filterSavedPosts(posts: SavedPost[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return posts;
  }

  return posts.filter(
    (post) =>
      post.caption.toLowerCase().includes(normalizedQuery) ||
      post.author.name.toLowerCase().includes(normalizedQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
  );
}

export const postService = {
  async getFeedPosts() {
    return clone(feedPosts);
  },

  async getTrends() {
    return clone(feedTrends);
  },

  async getSavedPosts() {
    return clone(savedPosts);
  },

  async getCreatePostCategories() {
    return clone(createPostCategories);
  },
};
