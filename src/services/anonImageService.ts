import { apiClient } from "@/services/apiClient";

export interface AnonImage {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function normalizeAnonImage(raw: Record<string, unknown>): AnonImage {
  return {
    id: str(raw["id"]) ?? str(raw["anonImageId"]) ?? "",
    name: str(raw["name"]) ?? str(raw["title"]) ?? "",
    imageUrl:
      str(raw["imageUrl"]) ?? str(raw["url"]) ?? str(raw["image"]) ?? str(raw["imageURL"]) ?? "",
    isActive: (raw["isActive"] as boolean) ?? true,
  };
}

function normalizeList(res: unknown): AnonImage[] {
  const list = Array.isArray(res)
    ? res
    : (((res as Record<string, unknown>)?.["items"] ??
        (res as Record<string, unknown>)?.["data"] ??
        (res as Record<string, unknown>)?.["results"] ??
        []) as unknown[]);
  return (list as Record<string, unknown>[])
    .map(normalizeAnonImage)
    .filter((x) => x.id && x.imageUrl);
}

export interface AnonImagePayload {
  name?: string | null;
  image?: File | null;
  isActive?: boolean | null;
}

function buildForm(payload: AnonImagePayload): FormData {
  const form = new FormData();
  if (payload.name != null) form.append("Name", payload.name);
  if (payload.image) form.append("Image", payload.image);
  if (payload.isActive != null) form.append("IsActive", String(payload.isActive));
  return form;
}

export const anonImageService = {
  /** Gallery of anonymous avatars. Pass activeOnly=false to include inactive ones (admin). */
  async getAnonImages(activeOnly = true): Promise<AnonImage[]> {
    const res = await apiClient.get<unknown>(
      `/api/v1/anon-images${activeOnly ? "?isActive=true" : ""}`,
    );
    return normalizeList(res);
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
