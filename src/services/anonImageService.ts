import { apiClient } from "@/services/apiClient";

export interface AnonImage {
  id: string;
  name: string;
  imageUrl: string;
  /** R2 storage key — used to match against the key returned by GET /users/me. */
  fileKey: string;
  isActive: boolean;
  /** Premium-only image: only subscribers may assign it as their anon avatar. */
  isExclusive: boolean;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function normalizeAnonImage(raw: Record<string, unknown>): AnonImage {
  return {
    id: str(raw["id"]) ?? str(raw["anonImageId"]) ?? "",
    name: str(raw["name"]) ?? str(raw["title"]) ?? "",
    imageUrl:
      str(raw["fileUrl"]) ??
      str(raw["imageUrl"]) ??
      str(raw["secureUrl"]) ??
      str(raw["url"]) ??
      str(raw["image"]) ??
      str(raw["imageURL"]) ??
      str(raw["photoUrl"]) ??
      str(raw["avatarUrl"]) ??
      "",
    fileKey: str(raw["fileKey"]) ?? "",
    isActive: (raw["isActive"] as boolean) ?? true,
    isExclusive: (raw["isExclusive"] as boolean) ?? false,
  };
}

function normalizeList(res: unknown): AnonImage[] {
  const list = Array.isArray(res)
    ? res
    : (((res as Record<string, unknown>)?.["items"] ??
        (res as Record<string, unknown>)?.["data"] ??
        (res as Record<string, unknown>)?.["results"] ??
        (res as Record<string, unknown>)?.["anonImages"] ??
        []) as unknown[]);
  const rawItems = (Array.isArray(list) ? list : []) as Record<string, unknown>[];
  const valid = rawItems.map(normalizeAnonImage).filter((x) => x.id && x.imageUrl);
  // Diagnostic: the API returned items but none had a recognizable image URL —
  // surface the actual field names so the mismatch is obvious instead of silent.
  if (rawItems.length > 0 && valid.length === 0) {
    const keys = Object.keys(rawItems[0] ?? {}).join(", ");
    throw new Error(
      `API trả ${rawItems.length} ảnh nhưng không đọc được URL. Field nhận được: [${keys}]`,
    );
  }
  return valid;
}

export interface AnonImagePayload {
  name?: string | null;
  image?: File | null;
  isActive?: boolean | null;
  isExclusive?: boolean | null;
}

function buildForm(payload: AnonImagePayload): FormData {
  const form = new FormData();
  if (payload.name != null) form.append("Name", payload.name);
  if (payload.image) form.append("Image", payload.image);
  if (payload.isActive != null) form.append("IsActive", String(payload.isActive));
  if (payload.isExclusive != null) form.append("IsExclusive", String(payload.isExclusive));
  return form;
}

export const anonImageService = {
  /**
   * Gallery of anonymous avatars. The backend returns active-only for users
   * without the `anon-images.read:all` permission, and all (incl. inactive) for
   * those who have it. Pass activeOnly=true to additionally filter client-side
   * so the avatar picker never offers an inactive image (assignment rejects it).
   */
  async getAnonImages(activeOnly = true): Promise<AnonImage[]> {
    const res = await apiClient.get<unknown>("/api/v1/anon-images");
    const parsed = normalizeList(res);
    return activeOnly ? parsed.filter((x) => x.isActive) : parsed;
  },

  async getAnonImageById(id: string): Promise<AnonImage> {
    const res = await apiClient.get<Record<string, unknown>>(`/api/v1/anon-images/${id}`);
    return normalizeAnonImage(res);
  },

  /** Create a gallery image (admin — Permission:anon-images.create). */
  async createAnonImage(payload: AnonImagePayload): Promise<AnonImage> {
    const res = await apiClient.postForm<Record<string, unknown>>(
      "/api/v1/anon-images",
      buildForm(payload),
    );
    return normalizeAnonImage(res ?? {});
  },

  /** Update a gallery image (admin — Permission:anon-images.update). Image is optional. */
  async updateAnonImage(id: string, payload: AnonImagePayload): Promise<AnonImage> {
    const res = await apiClient.putForm<Record<string, unknown>>(
      `/api/v1/anon-images/${id}`,
      buildForm(payload),
    );
    return normalizeAnonImage(res ?? {});
  },

  /** Soft delete (admin — Permission:anon-images.delete). */
  async deleteAnonImage(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/anon-images/${id}`);
  },

  /** Permanent delete (admin — Permission:anon-images.delete). */
  async permanentDeleteAnonImage(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/anon-images/${id}/permanent`);
  },

  /** Assign one of the gallery images as the current user's anonymous avatar. */
  async setMyAnonImage(anonImageId: string): Promise<void> {
    await apiClient.patch(`/api/v1/users/me/anon-image/${anonImageId}`);
  },
};
