import { premiumPlans } from "@/mocks/content";

const clone = <T>(value: T): T => structuredClone(value);

export const billingService = {
  async getPremiumPlans() {
    return clone(premiumPlans);
  },
};
