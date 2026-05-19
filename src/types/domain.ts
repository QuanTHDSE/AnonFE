export interface User {
  email: string;
  name: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  image: string;
  caption: string;
  tags: string[];
  time: string;
  likes: number;
  comments: number;
  rating: number;
}

export interface SavedPost extends Post {
  savedAt: string;
}

export type LeaderboardTrend = "up" | "down" | "same";

export interface LeaderboardPost {
  id: string;
  rank: number;
  title: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  timeAgo: string;
  trend: LeaderboardTrend;
  category: string;
}

export interface FollowingUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
}

export type BillingCycle = "monthly" | "yearly";

export interface PremiumPlan {
  name: string;
  price: Record<BillingCycle, string>;
  description: string;
  popular?: boolean;
  features: Array<{
    name: string;
    included: boolean;
  }>;
  buttonText: string;
  buttonStyle: string;
}
