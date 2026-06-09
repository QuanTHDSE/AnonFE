export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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

export interface Subject {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string;
  postCount?: number;
  createdAt?: string;
}

export interface CreateSubjectPayload {
  name: string;
  slug: string;
  iconEmoji: string;
}

export interface UpdateSubjectPayload {
  name: string;
  slug: string;
  iconEmoji: string;
}

export interface GetSubjectsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedSubjectsResponse {
  subjects: Subject[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  tags?: string[];
  newImages?: File[];
  removeImageUrls?: string[];
}

export interface CreatePostPayload {
  title: string;
  content: string;
  subjectId: string;
  tags?: string[];
  isAnonymous?: boolean;
  images?: File[];
}

export interface FeedPostItem {
  id: string;
  title: string;
  content: string;
  images?: string[] | null;
  tags?: string[] | null;
  isAnonymous: boolean;
  subject?: Subject | null;
  /** Real author id from the backend, kept even for anonymous posts (for owner-scoped filtering). Do not use for display. */
  authorId?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    isPremium?: boolean;
  } | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  hasUpvoted?: boolean;
}

export interface PaginatedPostsResponse {
  posts: FeedPostItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
