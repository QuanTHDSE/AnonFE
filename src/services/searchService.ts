import { apiClient } from "@/services/apiClient";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";
import type { FeedPostItem } from "@/types";

export interface SearchUserItem {
  id: string;
  username: string;
  email?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  anonAlias: string;
  isAnonDefault: boolean;
  followerCount: number;
  followingCount: number;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawSearchPostDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string | null;
  isAnonymous: boolean;
  authorAvatarUrl?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  media?: Array<{
    id: string;
    fileKey: string;
    fileUrl?: string;
    publicUrl: string;
    contentType?: string;
    displayOrder?: number;
    fileSize?: number;
    originalFileName?: string;
    mediaType?: string;
  }>;
  tags?: string[];
  upvotes: number;
  commentsCount: number;
  viewCount: number;
  averageRating: number;
  ratingsCount: number;
  qualityScore: number;
  myStars?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  hasUpvoted?: boolean;
}

export interface RawSearchUserDto {
  id: string;
  username: string;
  email?: string | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  anonAlias: string;
  isAnonDefault: boolean;
  followerCount: number;
  followingCount: number;
  hasActiveSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchAllResponse {
  posts: {
    posts: RawSearchPostDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  users: {
    users: RawSearchUserDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  query: string;
}

export interface SearchPostsResult {
  posts: FeedPostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchUsersResult {
  users: SearchUserItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const searchService = {
  /**
   * Search both posts and users in a single request.
   */
  async searchAll(
    query: string,
    limit = 5,
  ): Promise<{ posts: FeedPostItem[]; users: SearchUserItem[]; query: string }> {
    if (!query || !query.trim()) {
      return { posts: [], users: [], query: "" };
    }

    const res = await apiClient.get<SearchAllResponse>(
      `/api/v1/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`,
    );

    const mappedPosts: FeedPostItem[] = (res.posts?.posts ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      isAnonymous: p.isAnonymous,
      authorId: p.authorId,
      author: {
        id: p.authorId,
        name: p.authorName ?? "Ẩn danh",
        avatar: toAbsoluteMediaUrl(p.authorAvatarUrl) ?? undefined,
      },
      images: (p.media ?? [])
        .filter((m) => m.mediaType === "Image" || m.contentType?.startsWith("image/"))
        .map((m) => m.fileUrl ?? m.publicUrl),
      media: (p.media ?? []).map((m) => ({
        id: m.id,
        url: m.fileUrl ?? m.publicUrl,
        contentType: m.contentType,
        fileName: m.originalFileName,
        fileSize: m.fileSize,
        displayOrder: m.displayOrder,
        mediaType: m.mediaType === "Image" ? "Image" : "File",
      })),
      tags: p.tags ?? [],
      subject: p.subjectId
        ? {
            id: p.subjectId,
            name: p.subjectName ?? "",
            slug: "",
            iconEmoji: "📚",
          }
        : null,
      likesCount: p.upvotes ?? 0,
      commentsCount: p.commentsCount ?? 0,
      hasUpvoted: p.hasUpvoted ?? false,
      averageRating: p.averageRating,
      ratingsCount: p.ratingsCount,
      myStars: p.myStars,
      createdAt: p.createdAt,
    }));

    const mappedUsers: SearchUserItem[] = (res.users?.users ?? []).map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      avatarKey: u.avatarKey,
      avatarUrl: toAbsoluteMediaUrl(u.avatarUrl),
      bio: u.bio,
      anonAlias: u.anonAlias,
      isAnonDefault: u.isAnonDefault,
      followerCount: u.followerCount ?? 0,
      followingCount: u.followingCount ?? 0,
      hasActiveSubscription: u.hasActiveSubscription ?? false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      posts: mappedPosts,
      users: mappedUsers,
      query: res.query ?? query,
    };
  },

  /**
   * Search posts with filters and pagination.
   */
  async searchPosts(
    query: string,
    params?: {
      subjectId?: string;
      tag?: string;
      sortBy?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<SearchPostsResult> {
    const qParams = new URLSearchParams();
    if (query) qParams.set("q", query.trim());
    if (params?.subjectId) qParams.set("subjectId", params.subjectId);
    if (params?.tag) qParams.set("tag", params.tag);
    if (params?.sortBy) qParams.set("sortBy", params.sortBy);
    if (params?.page) qParams.set("page", String(params.page));
    if (params?.pageSize) qParams.set("pageSize", String(params.pageSize));

    const res = await apiClient.get<{
      posts: RawSearchPostDto[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/v1/search/posts?${qParams.toString()}`);

    const mappedPosts: FeedPostItem[] = (res.posts ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      isAnonymous: p.isAnonymous,
      authorId: p.authorId,
      author: {
        id: p.authorId,
        name: p.authorName ?? "Ẩn danh",
        avatar: toAbsoluteMediaUrl(p.authorAvatarUrl) ?? undefined,
      },
      images: (p.media ?? [])
        .filter((m) => m.mediaType === "Image" || m.contentType?.startsWith("image/"))
        .map((m) => m.fileUrl ?? m.publicUrl),
      media: (p.media ?? []).map((m) => ({
        id: m.id,
        url: m.fileUrl ?? m.publicUrl,
        contentType: m.contentType,
        fileName: m.originalFileName,
        fileSize: m.fileSize,
        displayOrder: m.displayOrder,
        mediaType: m.mediaType === "Image" ? "Image" : "File",
      })),
      tags: p.tags ?? [],
      subject: p.subjectId
        ? {
            id: p.subjectId,
            name: p.subjectName ?? "",
            slug: "",
            iconEmoji: "📚",
          }
        : null,
      likesCount: p.upvotes ?? 0,
      commentsCount: p.commentsCount ?? 0,
      hasUpvoted: p.hasUpvoted ?? false,
      averageRating: p.averageRating,
      ratingsCount: p.ratingsCount,
      myStars: p.myStars,
      createdAt: p.createdAt,
    }));

    return {
      posts: mappedPosts,
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    };
  },

  /**
   * Search users with pagination.
   */
  async searchUsers(query: string, page = 1, pageSize = 10): Promise<SearchUsersResult> {
    const qParams = new URLSearchParams();
    if (query) qParams.set("q", query.trim());
    qParams.set("page", String(page));
    qParams.set("pageSize", String(pageSize));

    const res = await apiClient.get<{
      users: RawSearchUserDto[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/v1/search/users?${qParams.toString()}`);

    return {
      users: (res.users ?? []).map((user) => ({
        ...user,
        avatarUrl: toAbsoluteMediaUrl(user.avatarUrl),
      })),
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    };
  },
};
