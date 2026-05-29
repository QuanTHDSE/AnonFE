import { apiClient } from "@/services/apiClient";
import type {
  CreatePostPayload,
  CreateSubjectPayload,
  FeedPostItem,
  GetSubjectsParams,
  PaginatedPostsResponse,
  PaginatedSubjectsResponse,
  SavedPost,
  Subject,
  UpdatePostPayload,
} from "@/types";

export interface GetPostsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

interface RawPostItem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorAnonAlias?: string;
  isAnonymous: boolean;
  subjectId: string;
  subjectName: string;
  imageUrls?: string[] | null;
  tags?: string[] | null;
  upvotes?: number;
  commentsCount?: number;
  createdAt: string;
}

interface RawPaginatedPostsResponse {
  posts: RawPostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function mapPost(raw: RawPostItem): FeedPostItem {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    isAnonymous: raw.isAnonymous,
    images: raw.imageUrls ?? [],
    tags: raw.tags ?? [],
    subject: raw.subjectId
      ? { id: raw.subjectId, name: raw.subjectName, slug: "", iconEmoji: "" }
      : null,
    author: raw.isAnonymous ? null : { id: raw.authorId, name: raw.authorUsername },
    createdAt: raw.createdAt,
    likesCount: raw.upvotes ?? 0,
    commentsCount: raw.commentsCount ?? 0,
  };
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
    const raw = await apiClient.get<RawPaginatedPostsResponse>(
      `/api/v1/posts${qs ? `?${qs}` : ""}`,
    );
    return {
      posts: raw.posts.map(mapPost),
      total: raw.total,
      page: raw.page,
      pageSize: raw.pageSize,
      totalPages: raw.totalPages,
    };
  },

  async getPostById(id: string): Promise<FeedPostItem> {
    const raw = await apiClient.get<RawPostItem>(`/api/v1/posts/${id}`);
    return mapPost(raw);
  },

  async getTrends(): Promise<string[]> {
    return [];
  },

  async getSavedPosts(): Promise<SavedPost[]> {
    return [];
  },

  async getSubjects(params: GetSubjectsParams = {}): Promise<PaginatedSubjectsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    const qs = query.toString();
    return apiClient.get<PaginatedSubjectsResponse>(`/api/v1/subjects${qs ? `?${qs}` : ""}`);
  },

  async createPost(payload: CreatePostPayload): Promise<void> {
    const form = new FormData();
    form.append("Title", payload.title);
    form.append("Content", payload.content);
    form.append("SubjectId", payload.subjectId);
    if (payload.isAnonymous !== undefined) form.append("IsAnonymous", String(payload.isAnonymous));
    payload.tags?.forEach((tag) => form.append("Tags", tag));
    payload.images?.forEach((file) => form.append("Images", file));
    await apiClient.postForm("/api/v1/posts", form);
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

  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    return apiClient.post<Subject>("/api/v1/subjects", payload);
  },
};
