import { apiClient } from "@/services/apiClient";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";
import type {
  CreatePostPayload,
  CreateSubjectPayload,
  FeedPostItem,
  GetSubjectsParams,
  PaginatedPostsResponse,
  PaginatedSubjectsResponse,
  PostMedia,
  PostMediaType,
  SavedPost,
  Subject,
  UpdatePostPayload,
  UpdateSubjectPayload,
} from "@/types";

export interface GetPostsParams {
  search?: string;
  page?: number;
  pageSize?: number;
  authorId?: string;
}

export interface TrendingTag {
  tag: string;
  count: number;
  engagement: number;
}

interface RawMediaItem {
  id: string;
  fileUrl?: string | null;
  url?: string | null;
  contentType?: string | null;
  originalFileName?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  displayOrder?: number | null;
  mediaType?: string | null;
}

interface RawPostItem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername?: string | null;
  authorAnonAlias?: string | null;
  // Anon-image URL for anonymous posts, real avatar URL otherwise.
  authorAvatarUrl?: string | null;
  isAnonymous: boolean;
  subjectId?: string | null;
  subjectName?: string | null;
  // Legacy field — older responses returned image URLs directly.
  imageUrls?: string[] | null;
  // Current field — unified media list (images + file attachments).
  media?: RawMediaItem[] | null;
  tags?: string[] | null;
  // upvote / like — try multiple API field names
  upvotes?: number;
  likesCount?: number;
  upvoteCount?: number;
  // upvote status for current user
  isUpvotedByMe?: boolean;
  hasUpvoted?: boolean;
  isUpvoted?: boolean;
  currentUserUpvoted?: boolean;
  isUpvotedByCurrentUser?: boolean;
  // comment count — try multiple API field names
  commentsCount?: number;
  commentCount?: number;
  totalComments?: number;
  numberOfComments?: number;
  // rating fields from API
  averageRating?: number;
  avgRating?: number;
  rating?: number;
  ratingsCount?: number;
  ratingCount?: number;
  totalRatings?: number;
  myStars?: number | null;
  userRating?: number | null;
  myRating?: number | null;
  status?: string;
  createdAt: string;
}

interface RawPaginatedPostsResponse {
  posts: RawPostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function mapMedia(raw: RawMediaItem): PostMedia | null {
  const url = raw.fileUrl ?? raw.url ?? null;
  if (!url) return null;
  const type: PostMediaType = (raw.mediaType ?? "").toLowerCase() === "file" ? "File" : "Image";
  return {
    id: raw.id,
    url,
    contentType: raw.contentType ?? undefined,
    fileName: raw.originalFileName ?? raw.fileName ?? undefined,
    fileSize: raw.fileSize ?? undefined,
    displayOrder: raw.displayOrder ?? undefined,
    mediaType: type,
  };
}

function mapPost(rawInput: RawPostItem, usernameMap: Record<string, string> = {}): FeedPostItem {
  const raw = rawInput as RawPostItem & Record<string, unknown>;
  const resolvedName = raw.authorUsername || usernameMap[raw.authorId];

  const media = (raw.media ?? [])
    .map(mapMedia)
    .filter((m): m is PostMedia => m !== null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  // Image URLs for display — prefer the new media list, fall back to legacy imageUrls.
  const images =
    media.length > 0
      ? media.filter((m) => m.mediaType === "Image").map((m) => m.url)
      : (raw.imageUrls ?? []);

  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    isAnonymous: raw.isAnonymous,
    images,
    media,
    tags: raw.tags ?? [],
    subject:
      raw.subjectId && raw.subjectName
        ? { id: raw.subjectId, name: raw.subjectName, slug: "", iconEmoji: "" }
        : null,
    authorId: raw.authorId,
    author: raw.isAnonymous
      ? {
          id: "",
          // For anonymous posts the API returns the anon alias in `authorUsername`
          // (older builds used `authorAnonAlias`); fall back through both.
          name: raw.authorAnonAlias || raw.authorUsername || "Ẩn danh",
          // `authorAvatarUrl` holds the anon-image URL for anonymous posts and
          // the real avatar URL otherwise. Absolutize in case it's a raw key.
          avatar: toAbsoluteMediaUrl(raw.authorAvatarUrl) ?? undefined,
        }
      : {
          id: raw.authorId,
          name: resolvedName || "Người dùng",
          avatar: toAbsoluteMediaUrl(raw.authorAvatarUrl) ?? undefined,
        },
    createdAt: raw.createdAt,
    likesCount: raw.upvotes ?? raw.likesCount ?? raw.upvoteCount ?? 0,
    hasUpvoted:
      raw.isUpvotedByMe ??
      raw.hasUpvoted ??
      raw.isUpvoted ??
      raw.currentUserUpvoted ??
      raw.isUpvotedByCurrentUser,
    commentsCount:
      raw.commentsCount ?? raw.commentCount ?? raw.totalComments ?? raw.numberOfComments ?? 0,
    averageRating:
      typeof raw.averageRating === "number"
        ? raw.averageRating
        : typeof raw.avgRating === "number"
          ? raw.avgRating
          : typeof raw.rating === "number"
            ? raw.rating
            : 0,
    ratingsCount:
      typeof raw.ratingsCount === "number"
        ? raw.ratingsCount
        : typeof raw.ratingCount === "number"
          ? raw.ratingCount
          : typeof raw.totalRatings === "number"
            ? raw.totalRatings
            : 0,
    myStars:
      typeof raw.myStars === "number" || raw.myStars === null
        ? raw.myStars
        : typeof raw.userRating === "number"
          ? raw.userRating
          : typeof raw.myRating === "number"
            ? raw.myRating
            : null,
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
    if (params.authorId) query.set("authorId", params.authorId);
    const qs = query.toString();
    const raw = await apiClient.get<RawPaginatedPostsResponse>(
      `/api/v1/posts${qs ? `?${qs}` : ""}`,
    );
    return {
      posts: raw.posts
        .filter((p) => (p.status ?? "").toLowerCase() !== "removed")
        .map((post) => mapPost(post)),
      total: raw.total,
      page: raw.page,
      pageSize: raw.pageSize,
      totalPages: raw.totalPages,
    };
  },

  // Top / trending posts — GET /api/v1/posts/top?range=&sort=&page=&pageSize=
  async getTopPosts(
    params: { range?: string; sort?: string; page?: number; pageSize?: number } = {},
  ): Promise<FeedPostItem[]> {
    const query = new URLSearchParams();
    query.set("range", params.range ?? "30d");
    query.set("sort", params.sort ?? "hot");
    query.set("page", String(params.page ?? 1));
    query.set("pageSize", String(params.pageSize ?? 20));
    const raw = await apiClient.get<RawPaginatedPostsResponse>(
      `/api/v1/posts/top?${query.toString()}`,
    );
    return (raw.posts ?? [])
      .filter((p) => (p.status ?? "").toLowerCase() !== "removed")
      .map((post) => mapPost(post));
  },

  async getPostById(id: string): Promise<FeedPostItem> {
    const raw = await apiClient.get<RawPostItem>(`/api/v1/posts/${id}`);
    return mapPost(raw);
  },

  async getTrends(): Promise<string[]> {
    return [];
  },

  // Trending tags computed from a recent sample of posts. The backend has no
  // dedicated trending endpoint, so we score tags by how many posts use them
  // weighted by engagement (upvotes + comments).
  async getTrendingTags(limit = 7): Promise<TrendingTag[]> {
    const { posts } = await this.getPosts({ pageSize: 100 });
    const score = new Map<string, { count: number; engagement: number }>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        const key = tag.trim();
        if (!key) continue;
        const entry = score.get(key) ?? { count: 0, engagement: 0 };
        entry.count += 1;
        entry.engagement += post.likesCount + post.commentsCount;
        score.set(key, entry);
      }
    }
    return [...score.entries()]
      .map(([tag, { count, engagement }]) => ({ tag, count, engagement }))
      .sort((a, b) => b.engagement - a.engagement || b.count - a.count)
      .slice(0, limit);
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
    payload.files?.forEach((file) => form.append("File", file));
    await apiClient.postForm("/api/v1/posts", form);
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<void> {
    const form = new FormData();
    if (payload.title !== undefined) form.append("Title", payload.title);
    if (payload.content !== undefined) form.append("Content", payload.content);
    payload.tags?.forEach((tag) => form.append("Tags", tag));
    payload.newImages?.forEach((file) => form.append("NewImages", file));
    payload.newFiles?.forEach((file) => form.append("NewFiles", file));
    // Removal is now by media ID (RemoveFileId), not by URL.
    payload.removeFileIds?.forEach((mediaId) => form.append("RemoveFileId", mediaId));
    await apiClient.putForm(`/api/v1/posts/${id}`, form);
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/posts/${id}`);
  },

  async upvotePost(id: string): Promise<void> {
    await apiClient.post(`/api/v1/posts/${id}/upvote`, {});
  },

  async ratePost(
    id: string,
    stars: number,
    review?: string,
  ): Promise<{
    postId: string;
    averageRating: number;
    ratingsCount: number;
    qualityScore?: number;
    myStars: number;
    myReview?: string;
    message?: string;
  }> {
    return apiClient.post(`/api/v1/posts/${id}/rate`, { stars, review });
  },

  async deletePostRating(id: string): Promise<{
    postId: string;
    averageRating: number;
    ratingsCount: number;
    myStars: null;
    message?: string;
  }> {
    return apiClient.delete(`/api/v1/posts/${id}/rate`);
  },

  async getPostRatings(id: string): Promise<{
    postId: string;
    averageRating: number;
    ratingsCount: number;
    myStars?: number | null;
  }> {
    return apiClient.get(`/api/v1/posts/${id}/ratings`);
  },

  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    return apiClient.post<Subject>("/api/v1/subjects", payload);
  },

  async getSubjectById(id: string): Promise<Subject> {
    return apiClient.get<Subject>(`/api/v1/subjects/${id}`);
  },

  async updateSubject(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    return apiClient.put<Subject>(`/api/v1/subjects/${id}`, payload);
  },

  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/subjects/${id}`);
  },

  async getSubjectPostCount(subjectId: string): Promise<number> {
    const resp = await apiClient.get<{ posts: { status?: string }[]; total: number }>(
      `/api/v1/subjects/${subjectId}/posts?pageSize=200`,
    );
    return resp.posts.filter((p) => (p.status ?? "").toLowerCase() !== "removed").length;
  },
};
