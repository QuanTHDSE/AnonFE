import { apiClient } from "@/services/apiClient";

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  content: string;
  isAnonymous: boolean;
  author?: CommentAuthor | null;
  likesCount: number;
  upvotesCount?: number;
  createdAt: string;
  updatedAt?: string | null;
  replies?: Comment[];
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function normalizeAuthor(raw: Record<string, unknown>): Comment["author"] {
  // Try nested author object first
  const nested = raw["author"] as Record<string, unknown> | undefined;
  const id =
    str(nested?.["id"]) ??
    str(nested?.["userId"]) ??
    str(raw["authorId"]) ??
    str(raw["userId"]) ??
    "";
  const name =
    str(nested?.["name"]) ??
    str(nested?.["username"]) ??
    str(nested?.["userName"]) ??
    str(raw["authorName"]) ??
    str(raw["userName"]) ??
    str(raw["username"]) ??
    undefined;
  const avatar =
    str(nested?.["avatar"]) ??
    str(nested?.["avatarUrl"]) ??
    str(raw["authorAvatar"]) ??
    str(raw["avatarUrl"]) ??
    undefined;
  if (!id && !name) return null;
  return { id, name: name ?? "", avatar };
}

function normalizeComment(raw: Record<string, unknown>): Comment {
  return {
    id: str(raw["id"]) ?? "",
    postId: str(raw["postId"]) ?? "",
    parentId: str(raw["parentId"]) ?? null,
    content: str(raw["content"]) ?? "",
    isAnonymous: (raw["isAnonymous"] as boolean) ?? false,
    author: normalizeAuthor(raw),
    likesCount: (raw["likesCount"] as number) ?? (raw["upvotesCount"] as number) ?? 0,
    createdAt: str(raw["createdAt"]) ?? new Date().toISOString(),
    updatedAt: str(raw["updatedAt"]) ?? null,
    replies: [],
  };
}

function normalizeList(res: unknown): Comment[] {
  if (!Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const list = obj.comments ?? obj.items ?? obj.data ?? obj.results ?? [];
    res = Array.isArray(list) ? list : [];
  }
  return (res as Record<string, unknown>[]).map(normalizeComment);
}

export const commentService = {
  async getComments(postId: string, page = 1, pageSize = 20): Promise<PaginatedCommentsResponse> {
    const res = await apiClient.get<unknown>(
      `/api/v1/comments/post/${postId}?page=${page}&pageSize=${pageSize}`,
    );
    if (Array.isArray(res)) {
      const list = res as Comment[];
      return { comments: list, total: list.length, page, pageSize, totalPages: 1 };
    }
    const obj = res as Record<string, unknown>;
    return {
      comments: normalizeList(res),
      total: (obj.total as number) ?? (obj.totalCount as number) ?? 0,
      page: (obj.page as number) ?? page,
      pageSize: (obj.pageSize as number) ?? pageSize,
      totalPages: (obj.totalPages as number) ?? 1,
    };
  },

  async createComment(payload: {
    postId: string;
    content: string;
    isAnonymous?: boolean;
    parentId?: string | null;
  }): Promise<Comment> {
    const res = await apiClient.post<unknown>("/api/v1/comments", payload);
    return normalizeComment(res as Record<string, unknown>);
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    return apiClient.put<Comment>(`/api/v1/comments/${commentId}`, content);
  },

  async deleteComment(commentId: string): Promise<void> {
    await apiClient.delete(`/api/v1/comments/${commentId}`);
  },

  async upvoteComment(commentId: string): Promise<void> {
    await apiClient.post(`/api/v1/comments/${commentId}/upvote`, {});
  },
};
