import { createBrowserRouter, type RouteObject } from "react-router";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootLayout } from "./RootLayout";
import { SignInView } from "@/features/auth/pages/SignInPage";
import { RegisterView } from "@/features/auth/pages/RegisterPage";
import { BookmarksView } from "@/features/bookmarks/pages/BookmarksPage";
import { CheckoutView } from "@/features/billing/pages/CheckoutPage";
import { PremiumView } from "@/features/billing/pages/PremiumPage";
import { ChatView } from "@/features/chat/pages/ChatPage";
import { HomeView } from "@/features/feed/pages/HomePage";
import { HistoricalLeaderboardView } from "@/features/leaderboard/pages/HistoryLeaderboardPage";
import { LeaderboardView } from "@/features/leaderboard/pages/LeaderboardPage";
import { CreatePostView } from "@/features/posts/pages/CreatePostPage";
import { EditPostView } from "@/features/posts/pages/EditPostPage";
import { PostDetailView } from "@/features/posts/pages/PostDetailPage";
import { FollowingView } from "@/features/social/pages/FollowingPage";
import { ProfileView } from "@/features/profile/pages/ProfilePage";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { AdminDashboardView } from "@/features/admin/pages/AdminDashboardPage";
import { AdminPostsView } from "@/features/admin/pages/AdminPostsPage";
import { AdminSubjectsView } from "@/features/admin/pages/AdminSubjectsPage";

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomeView,
      },
      {
        path: "signin",
        Component: SignInView,
      },
      {
        path: "register",
        Component: RegisterView,
      },
      {
        path: "posts/:id",
        Component: PostDetailView,
      },
      {
        path: "leaderboard",
        Component: LeaderboardView,
      },
      {
        path: "history",
        Component: HistoricalLeaderboardView,
      },
      {
        path: "premium",
        Component: PremiumView,
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "create",
            Component: CreatePostView,
          },
          {
            path: "posts/:id/edit",
            Component: EditPostView,
          },
          {
            path: "chat",
            Component: ChatView,
          },
          {
            path: "bookmarks",
            Component: BookmarksView,
          },
          {
            path: "following",
            Component: FollowingView,
          },
          {
            path: "profile",
            Component: ProfileView,
          },
          {
            path: "checkout",
            Component: CheckoutView,
          },
        ],
      },
      {
        Component: AdminRoute,
        children: [
          {
            path: "admin",
            Component: AdminLayout,
            children: [
              {
                index: true,
                Component: AdminDashboardView,
              },
              {
                path: "posts",
                Component: AdminPostsView,
              },
              {
                path: "subjects",
                Component: AdminSubjectsView,
              },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
