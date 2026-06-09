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

export const anonImageService = {
  /** Gallery of selectable anonymous avatars. */
  async getAnonImages(activeOnly = true): Promise<AnonImage[]> {
    const res = await apiClient.get<unknown>(
      `/api/v1/anon-images${activeOnly ? "?isActive=true" : ""}`,
    );
    return normalizeList(res);
  },

  /** Assign one of the gallery images as the current user's anonymous avatar. */
  async setMyAnonImage(anonImageId: string): Promise<void> {
    await apiClient.patch(`/api/v1/users/me/anon-image/${anonImageId}`);
  },
};
