import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { followService, type FollowStats } from "@/services/followService";
import { postService } from "@/services/postService";
import { userService, type UserProfile } from "@/services/userService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { FeedPostItem } from "@/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function UserProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = !!user && user.id === id;

  useEffect(() => {
    if (!id) return;

    // Redirect to own profile page
    if (isOwnProfile) {
      navigate("/profile", { replace: true });
      return;
    }

    setIsLoading(true);
    setError("");

    const statsPromise = isLoggedIn
      ? followService.getStats(id)
      : Promise.resolve<FollowStats>({ followerCount: 0, followingCount: 0, isFollowing: false });

    const profileId = id;
    Promise.all([
      userService.getUserById(profileId),
      postService.getPosts({ authorId: profileId, pageSize: 50 }),
      statsPromise,
    ])
      .then(([prof, postsRes, stats]) => {
        setProfile(prof);
        setPosts(postsRes.posts.filter((p) => !p.isAnonymous && p.author?.id === profileId));
        setFollowStats(stats);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Không tìm thấy người dùng."),
      )
      .finally(() => setIsLoading(false));
  }, [id, isOwnProfile, isLoggedIn, navigate]);

  const handleFollow = async () => {
    if (!id || !isLoggedIn) {
      navigate("/signin");
      return;
    }
    setIsFollowLoading(true);
    try {
      if (followStats?.isFollowing) {
        await followService.unfollow(id);
        setFollowStats((prev) =>
          prev ? { ...prev, isFollowing: false, followerCount: prev.followerCount - 1 } : prev,
        );
      } else {
        await followService.follow(id);
        setFollowStats((prev) =>
          prev ? { ...prev, isFollowing: true, followerCount: prev.followerCount + 1 } : prev,
        );
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="following" />

      <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 max-w-[960px] mx-auto w-full pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors p-2 -ml-2 rounded-xl group mb-8"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold hidden sm:block">Quay lại</span>
        </button>

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
            <p className="font-bold text-lg text-red-500">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-10 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3 w-full">
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-56" />
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-10 bg-gray-100 rounded-xl w-36 mt-4" />
              </div>
            </div>
          </div>
        )}

        {/* Profile card */}
        {!isLoading && profile && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-10"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-4 border-orange-100 flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-[#F15B29]">{initials}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                      {profile.username}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium mb-1">
                      Alias ẩn danh:{" "}
                      <span className="font-bold text-gray-600">{profile.anonAlias}</span>
                    </p>
                    {profile.bio && (
                      <p className="text-sm text-gray-600 font-medium mb-3 max-w-md">
                        {profile.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm mt-2">
                      <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                        <Calendar size={14} />
                        Tham gia {formatDate(profile.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <FileText size={14} className="text-[#F15B29]" />
                        {posts.length} bài viết công khai
                      </div>
                    </div>

                    {/* Follow stats */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#F15B29] font-extrabold text-base">
                          {followStats?.followerCount ?? 0}
                        </span>
                        <span className="text-gray-500 font-medium">người theo dõi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#F15B29] font-extrabold text-base">
                          {followStats?.followingCount ?? 0}
                        </span>
                        <span className="text-gray-500 font-medium">đang theo dõi</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow button */}
                  {isLoggedIn && (
                    <button
                      onClick={() => void handleFollow()}
                      disabled={isFollowLoading}
                      className={`shrink-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 ${
                        followStats?.isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200"
                          : "bg-[#F15B29] text-white hover:bg-[#d94a1d] shadow-md shadow-orange-100"
                      }`}
                    >
                      {isFollowLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : followStats?.isFollowing ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      {isFollowLoading
                        ? "Đang xử lý..."
                        : followStats?.isFollowing
                          ? "Đang theo dõi"
                          : "Theo dõi"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Posts section */}
        {!isLoading && profile && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">Bài viết công khai</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">
                Chỉ hiển thị bài viết không ẩn danh
              </p>
            </div>

            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4 bg-white rounded-3xl border border-gray-100">
                <FileText size={56} className="opacity-40" />
                <p className="text-lg font-bold text-gray-400">Chưa có bài viết nào</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {posts.map((post) => {
                    const images = post.images ?? [];
                    const tags = post.tags ?? [];
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {images.length > 0 && (
                          <Link to={`/posts/${post.id}`} className="block">
                            <div className="relative aspect-video overflow-hidden bg-gray-50">
                              <ImageWithFallback
                                src={images[0]}
                                alt={post.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                              {images.length > 1 && (
                                <span className="absolute bottom-2 right-2 text-xs font-bold bg-black/50 text-white px-2 py-0.5 rounded-full">
                                  +{images.length - 1}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3 gap-2">
                            <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-[#F15B29] rounded-full border border-orange-100 shrink-0">
                              {post.subject?.iconEmoji} {post.subject?.name ?? "—"}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {formatRelativeTime(post.createdAt)}
                            </span>
                          </div>
                          <Link to={`/posts/${post.id}`} className="group block mb-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">
                            {post.content}
                          </p>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-xs text-[#F15B29] font-semibold">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-5 pt-3 border-t border-gray-100">
                            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                              <Heart size={15} />
                              <span className="font-semibold">{post.likesCount}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                              <MessageSquare size={15} />
                              <span className="font-semibold">{post.commentsCount}</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
