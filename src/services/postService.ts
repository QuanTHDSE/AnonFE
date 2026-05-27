import { apiClient } from "@/services/apiClient";
import type { CreatePostPayload, FeedPostItem, PaginatedPostsResponse, SavedPost, Subject, UpdatePostPayload } from "@/types";

export interface GetPostsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

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
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedPostsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString();
    const res = await apiClient.get<PaginatedPostsResponse>(`/api/v1/posts${qs ? `?${qs}` : ""}`);
    return res;
  },

  async getPostById(id: string): Promise<FeedPostItem> {
    return apiClient.get<FeedPostItem>(`/api/v1/posts/${id}`);
  },

  async getTrends(): Promise<string[]> {
    return [];
  },

  async getSavedPosts(): Promise<SavedPost[]> {
    return [];
  },

  async getSubjects(): Promise<Subject[]> {
    const res = await apiClient.get<{ subjects: Subject[] }>("/api/v1/subjects");
    return res.subjects;
  },

  async createPost(payload: CreatePostPayload): Promise<void> {
    await apiClient.post("/api/v1/posts", payload);
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<void> {
    const form = new FormData();
    if (payload.title !== undefined) form.append("Title", payload.title);
    if (payload.content !== undefined) form.append("Content", payload.content);
    payload.tags?.forEach((tag) => form.append("Tags", tag));
    payload.newImages?.forEach((file) => form.append("NewImages", file));
    payload.removeImageUrls?.forEach((url) => form.append("RemoveImageUrls", url));
    await apiClient.putForm(`/api/v1/posts/${id}`, form);
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/posts/${id}`);
  },
};
