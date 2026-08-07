import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/services/apiClient";
import { searchService } from "@/services/searchService";
import { fetchPremiumStatusSafe } from "@/services/subscriptionService";
import { getUserPremium } from "@/services/userService";

vi.mock("@/services/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

vi.mock("@/services/searchService", () => ({
  searchService: { searchUsers: vi.fn() },
}));

vi.mock("@/services/subscriptionService", () => ({
  fetchPremiumStatusSafe: vi.fn(),
}));

const getMock = vi.mocked(apiClient.get);
const searchUsersMock = vi.mocked(searchService.searchUsers);
const subscriptionFallbackMock = vi.mocked(fetchPremiumStatusSafe);

describe("getUserPremium", () => {
  beforeEach(() => {
    getMock.mockReset();
    searchUsersMock.mockReset();
    subscriptionFallbackMock.mockReset();
  });

  it("uses the public search status for another user", async () => {
    getMock.mockResolvedValue({ id: "premium-1", username: "premium user" });
    searchUsersMock.mockResolvedValue({
      users: [
        {
          id: "premium-1",
          username: "premium user",
          anonAlias: "anon",
          isAnonDefault: false,
          followerCount: 0,
          followingCount: 0,
          hasActiveSubscription: true,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    await expect(getUserPremium("premium-1", "premium user")).resolves.toBe(true);
    expect(subscriptionFallbackMock).not.toHaveBeenCalled();
  });

  it("treats an exact public inactive status as authoritative", async () => {
    getMock.mockResolvedValue({ id: "regular-1", username: "regular user" });
    searchUsersMock.mockResolvedValue({
      users: [
        {
          id: "regular-1",
          username: "regular user",
          anonAlias: "anon",
          isAnonDefault: false,
          followerCount: 0,
          followingCount: 0,
          hasActiveSubscription: false,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    await expect(getUserPremium("regular-1", "regular user")).resolves.toBe(false);
    expect(subscriptionFallbackMock).not.toHaveBeenCalled();
  });

  it("falls back to the subscription endpoint when public search fails", async () => {
    getMock.mockResolvedValue({ id: "fallback-1", username: "fallback user" });
    searchUsersMock.mockRejectedValue(new Error("Search unavailable"));
    subscriptionFallbackMock.mockResolvedValue(true);

    await expect(getUserPremium("fallback-1", "fallback user")).resolves.toBe(true);
    expect(subscriptionFallbackMock).toHaveBeenCalledWith("fallback-1");
  });
});
