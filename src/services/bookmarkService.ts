import { apiClient } from "@/services/apiClient";
import type { FeedPostItem, Subject } from "@/types";

export interface BookmarkPost {
  id: string;
  postId: string;
  createdAt: string;
  title?: string;
  content?: string;
  isAnonymous?: boolean;
  images?: string[] | null;
  tags?: string[] | null;
  likesCount?: number;
  commentsCount?: number;
  subject?: Subject | null;
  author?: { id: string; name: string; avatar?: string | null } | null;
  post?: FeedPostItem | null;
}

export interface PaginatedBookmarksResponse {
  items: BookmarkPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

// Image URLs for the thumbnail. Prefer the new `media` list (filtering to
// images), fall back to the legacy `imageUrls`/`images` arrays.
function extractImages(source: Record<string, unknown>): string[] | null {
  const media = source["media"];
  if (Array.isArray(media)) {
    const urls = media
      .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
      .filter((m) => String(m["mediaType"] ?? "").toLowerCase() !== "file")
      .map((m) => str(m["fileUrl"]) ?? str(m["url"]))
      .filter((u): u is string => !!u);
    if (urls.length > 0) return urls;
  }
  return (source["imageUrls"] ?? source["images"] ?? null) as string[] | null;
}

function extractPost(raw: Record<string, unknown>): BookmarkPost {
  // Backend may return bookmark wrapper { id, postId, post: {...} }
  // or may return the post directly with bookmarkId etc.
  const embedded = raw["post"] as Record<string, unknown> | undefined;
  const source = embedded ?? raw;
  const isAnon = (source["isAnonymous"] as boolean) ?? false;

  const authorRaw = source["author"] as Record<string, unknown> | undefined | null;
  let authorName: string;
  let authorId: string;
  let authorAvatar: string | undefined;

  // Anon-image URL for anonymous posts, real avatar otherwise (post-level field).
  const postAvatarUrl = str(source["authorAvatarUrl"]);

  if (authorRaw) {
    authorId = str(authorRaw["id"]) ?? str(source["authorId"]) ?? "";
    authorAvatar =
      postAvatarUrl ?? str(authorRaw["avatar"]) ?? str(authorRaw["avatarUrl"]) ?? undefined;
    authorName = isAnon
      ? (str(source["authorAnonAlias"]) ??
        str(source["authorUsername"]) ??
        str(authorRaw["name"]) ??
        "Ẩn danh")
      : (str(authorRaw["name"]) ??
        str(authorRaw["username"]) ??
        str(source["authorUsername"]) ??
        "Người dùng");
  } else {
    authorId = str(source["authorId"]) ?? "";
    authorAvatar = postAvatarUrl ?? undefined;
    authorName = isAnon
      ? (str(source["authorAnonAlias"]) ?? str(source["authorUsername"]) ?? "Ẩn danh")
      : (str(source["authorUsername"]) ?? "Người dùng");
  }
  const author = { id: authorId, name: authorName, avatar: authorAvatar };

  const subjectRaw = source["subject"] as Record<string, unknown> | undefined;
  const subject: Subject | null = subjectRaw
    ? {
        id: str(subjectRaw["id"]) ?? "",
        name: str(subjectRaw["name"]) ?? "",
        slug: str(subjectRaw["slug"]) ?? "",
        iconEmoji: str(subjectRaw["iconEmoji"]) ?? "",
      }
    : source["subjectId"] && source["subjectName"]
      ? {
          id: str(source["subjectId"]) ?? "",
          name: str(source["subjectName"]) ?? "",
          slug: "",
          iconEmoji: "",
        }
      : null;

  return {
    id: str(raw["id"]) ?? "",
    postId: str(raw["postId"]) ?? str(source["id"]) ?? "",
    createdAt: str(raw["createdAt"]) ?? new Date().toISOString(),
    title: str(source["title"]),
    content: str(source["content"]),
    isAnonymous: (source["isAnonymous"] as boolean) ?? false,
    images: extractImages(source),
    tags: source["tags"] as string[] | null,
    likesCount: (source["likesCount"] ?? source["upvotes"] ?? source["upvoteCount"] ?? 0) as number,
    commentsCount: (source["commentsCount"] ?? source["commentCount"] ?? 0) as number,
    subject,
    author,
  };
}

function normalizeListResponse(res: unknown): PaginatedBookmarksResponse {
  const obj = res as Record<string, unknown>;
  const rawList = (obj["items"] ?? obj["bookmarks"] ?? obj["data"] ?? obj["results"]) as
    | Record<string, unknown>[]
    | undefined;
  const list = Array.isArray(rawList)
    ? rawList
    : Array.isArray(res)
      ? (res as Record<string, unknown>[])
      : [];
  return {
    items: list.map(extractPost),
    total: (obj["total"] ?? obj["totalCount"] ?? list.length) as number,
    page: (obj["page"] ?? 1) as number,
    pageSize: (obj["pageSize"] ?? 10) as number,
    totalPages: (obj["totalPages"] ?? 1) as number,
  };
}

export const bookmarkService = {
  async getBookmarks(
    params: { search?: string; page?: number; pageSize?: number } = {},
  ): Promise<PaginatedBookmarksResponse> {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.page) q.set("page", String(params.page));
    if (params.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString();
    const res = await apiClient.get<unknown>(`/api/v1/bookmarks${qs ? `?${qs}` : ""}`);
    return normalizeListResponse(res);
  },

  async addBookmark(postId: string): Promise<void> {
    await apiClient.post("/api/v1/bookmarks", { postId });
  },

  async removeBookmark(postId: string): Promise<void> {
    await apiClient.delete(`/api/v1/bookmarks/${postId}`);
  },

  async checkBookmark(postId: string): Promise<boolean> {
    try {
      const res = await apiClient.get<unknown>(`/api/v1/bookmarks/${postId}/exists`);
      if (typeof res === "boolean") return res;
      const obj = res as Record<string, unknown>;
      return Boolean(obj["isBookmarked"] ?? obj["exists"] ?? obj["result"] ?? false);
    } catch {
      return false;
    }
  },
};
