import { describe, expect, it } from "vitest";
import { createOutgoingMessage } from "./chatService";
import { filterLeaderboardPosts } from "./leaderboardService";
import { filterSavedPosts } from "./postService";
import { filterFollowingUsers } from "./socialService";
import type { FollowingUser, LeaderboardPost, SavedPost } from "@/types";

const savedPosts: SavedPost[] = [
  {
    id: "1",
    author: { name: "arch_daily" },
    image: "",
    caption: "Minimal architecture study",
    tags: ["architecture"],
    time: "1d",
    likes: 1,
    comments: 0,
    rating: 4,
    savedAt: "today",
  },
];

const leaderboardPosts: LeaderboardPost[] = [
  {
    id: "1",
    rank: 1,
    title: "Poster system",
    image: "",
    author: { name: "creative_mind", avatar: "" },
    likes: 10,
    comments: 2,
    timeAgo: "today",
    trend: "up",
    category: "Thiết kế đồ họa",
  },
];

const followingUsers: FollowingUser[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    username: "@sjenkins",
    avatar: "",
    bio: "",
    isFollowing: true,
  },
];

describe("service filter helpers", () => {
  it("filters saved posts by caption, author, or tag", () => {
    expect(filterSavedPosts(savedPosts, "arch")).toHaveLength(1);
    expect(filterSavedPosts(savedPosts, "missing")).toHaveLength(0);
  });

  it("filters leaderboard posts by search and category", () => {
    expect(filterLeaderboardPosts(leaderboardPosts, "poster", "Tất cả")).toHaveLength(1);
    expect(filterLeaderboardPosts(leaderboardPosts, "", "Marketing")).toHaveLength(0);
  });

  it("filters followed users by name or handle", () => {
    expect(filterFollowingUsers(followingUsers, "@sjenkins")).toHaveLength(1);
    expect(filterFollowingUsers(followingUsers, "nobody")).toHaveLength(0);
  });

  it("creates a sent chat message from text", () => {
    const message = createOutgoingMessage("  hello  ", new Date(0));

    expect(message).toMatchObject({
      id: "m_0",
      senderId: "me",
      text: "hello",
      status: "sent",
    });
  });
});
