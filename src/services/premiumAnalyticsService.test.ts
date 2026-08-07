import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUsers: vi.fn(),
  getUserSubscriptions: vi.fn(),
}));

vi.mock("@/services/userService", () => ({
  userService: { getUsers: mocks.getUsers },
}));

vi.mock("@/services/subscriptionService", () => ({
  subscriptionService: { getUserSubscriptions: mocks.getUserSubscriptions },
}));

import { premiumAnalyticsService } from "@/services/premiumAnalyticsService";

describe("premiumAnalyticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("summarizes unique Premium buyers and their subscriptions", async () => {
    const now = Date.now();
    const activeExpiry = new Date(now + 3 * 86_400_000).toISOString();
    const expiredAt = new Date(now - 86_400_000).toISOString();

    mocks.getUsers.mockResolvedValue({
      users: [
        { id: "user-1", username: "An", email: "an@example.com" },
        { id: "user-2", username: "Binh", email: "binh@example.com" },
        { id: "user-3", username: "Chi", email: "chi@example.com" },
      ],
      total: 3,
      totalPages: 1,
    });

    mocks.getUserSubscriptions.mockImplementation(async (userId: string) => {
      if (userId === "user-1") {
        return {
          items: [
            {
              id: "sub-1",
              userId,
              planId: "plan-a",
              orderId: "order-1",
              status: 0,
              startedAt: new Date(now).toISOString(),
              expiresAt: activeExpiry,
              createdAt: new Date(now).toISOString(),
              planName: "Premium tháng",
            },
            {
              id: "sub-2",
              userId,
              planId: "plan-b",
              orderId: "order-2",
              status: 1,
              startedAt: expiredAt,
              expiresAt: expiredAt,
              createdAt: expiredAt,
              planName: "Premium năm",
            },
          ],
        };
      }

      if (userId === "user-2") {
        return {
          items: [
            {
              id: "sub-3",
              userId,
              planId: "plan-a",
              orderId: "order-3",
              status: 1,
              startedAt: expiredAt,
              expiresAt: expiredAt,
              createdAt: expiredAt,
              planName: "Premium tháng",
            },
          ],
        };
      }

      return { items: [] };
    });

    const summary = await premiumAnalyticsService.getSummary();

    expect(summary.totalBuyers).toBe(2);
    expect(summary.activeBuyers).toBe(1);
    expect(summary.expiringSoonBuyers).toBe(1);
    expect(summary.totalSubscriptions).toBe(3);
    expect(summary.recentBuyers).toHaveLength(2);
    expect(summary.planBreakdown).toEqual([
      { planName: "Premium tháng", buyers: 2 },
      { planName: "Premium năm", buyers: 1 },
    ]);
  });
});
