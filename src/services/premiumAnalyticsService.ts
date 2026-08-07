import { subscriptionService, type UserSubscription } from "@/services/subscriptionService";
import { userService, type UserProfile } from "@/services/userService";

const USER_PAGE_SIZE = 100;
const SUBSCRIPTION_PAGE_SIZE = 100;
const REQUEST_BATCH_SIZE = 8;
const EXPIRING_SOON_DAYS = 7;

export interface PremiumBuyerSummary {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  latestSubscription: UserSubscription;
  purchaseCount: number;
}

export interface PremiumPlanBreakdown {
  planName: string;
  buyers: number;
}

export interface PremiumAnalyticsSummary {
  totalBuyers: number;
  activeBuyers: number;
  expiringSoonBuyers: number;
  totalSubscriptions: number;
  failedUserCount: number;
  recentBuyers: PremiumBuyerSummary[];
  planBreakdown: PremiumPlanBreakdown[];
}

interface UserSubscriptionsResult {
  user: UserProfile;
  subscriptions: UserSubscription[];
}

async function getAllUsers(): Promise<UserProfile[]> {
  const firstPage = await userService.getUsers(1, USER_PAGE_SIZE);
  const totalPages = Math.max(
    firstPage.totalPages ?? 1,
    Math.ceil((firstPage.total ?? firstPage.users.length) / USER_PAGE_SIZE),
  );

  if (totalPages <= 1) return firstPage.users ?? [];

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      userService.getUsers(index + 2, USER_PAGE_SIZE),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.users ?? []);
}

function isActiveSubscription(subscription: UserSubscription, now: number): boolean {
  return subscription.status === 0 && new Date(subscription.expiresAt).getTime() > now;
}

function latestSubscription(subscriptions: UserSubscription[]): UserSubscription {
  return [...subscriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

export const premiumAnalyticsService = {
  async getSummary(): Promise<PremiumAnalyticsSummary> {
    const users = await getAllUsers();
    const results: UserSubscriptionsResult[] = [];
    let failedUserCount = 0;

    for (let index = 0; index < users.length; index += REQUEST_BATCH_SIZE) {
      const batch = users.slice(index, index + REQUEST_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (user): Promise<UserSubscriptionsResult | null> => {
          try {
            const response = await subscriptionService.getUserSubscriptions(
              user.id,
              1,
              SUBSCRIPTION_PAGE_SIZE,
            );
            return { user, subscriptions: response.items ?? [] };
          } catch {
            failedUserCount += 1;
            return null;
          }
        }),
      );
      results.push(...batchResults.filter((result): result is UserSubscriptionsResult => !!result));
    }

    const buyers = results.filter((result) => result.subscriptions.length > 0);
    const now = Date.now();
    const expiringSoonLimit = now + EXPIRING_SOON_DAYS * 86_400_000;
    const planBuyers = new Map<string, Set<string>>();

    for (const { user, subscriptions } of buyers) {
      for (const subscription of subscriptions) {
        const planName = subscription.planName?.trim() || "Premium";
        const userIds = planBuyers.get(planName) ?? new Set<string>();
        userIds.add(user.id);
        planBuyers.set(planName, userIds);
      }
    }

    const recentBuyers = buyers
      .map(({ user, subscriptions }) => ({
        userId: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        latestSubscription: latestSubscription(subscriptions),
        purchaseCount: subscriptions.length,
      }))
      .sort(
        (a, b) =>
          new Date(b.latestSubscription.createdAt).getTime() -
          new Date(a.latestSubscription.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      totalBuyers: buyers.length,
      activeBuyers: buyers.filter(({ subscriptions }) =>
        subscriptions.some((subscription) => isActiveSubscription(subscription, now)),
      ).length,
      expiringSoonBuyers: buyers.filter(({ subscriptions }) =>
        subscriptions.some((subscription) => {
          const expiresAt = new Date(subscription.expiresAt).getTime();
          return isActiveSubscription(subscription, now) && expiresAt <= expiringSoonLimit;
        }),
      ).length,
      totalSubscriptions: buyers.reduce((total, buyer) => total + buyer.subscriptions.length, 0),
      failedUserCount,
      recentBuyers,
      planBreakdown: [...planBuyers.entries()]
        .map(([planName, userIds]) => ({ planName, buyers: userIds.size }))
        .sort((a, b) => b.buyers - a.buyers),
    };
  },
};
