import React, { useEffect, useState } from "react";
import {
  Award,
  Crown,
  Loader2,
  Lock,
  Search,
  Star,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { followService, type FollowUserItem } from "@/services/followService";
import { userService, type TopContributor } from "@/services/userService";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { UserPremiumBadge } from "@/shared/components/UserPremiumBadge";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";

type TabType = "top-contributors" | "following" | "followers";

export function FollowingView() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  // Default to top-contributors when not logged in
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    isLoggedIn ? "following" : "top-contributors",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [followingList, setFollowingList] = useState<FollowUserItem[]>([]);
  const [followersList, setFollowersList] = useState<FollowUserItem[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const followingPromise = user
      ? followService.getFollowing(user.id, 1, 100)
      : Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });

    const followersPromise = user
      ? followService.getFollowers(user.id, 1, 100)
      : Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });

    const contributorsPromise = userService.getTopContributors(20);

    Promise.all([followingPromise, followersPromise, contributorsPromise])
      .then(([followingRes, followersRes, contributorsRes]) => {
        setFollowingList(followingRes.data);
        setFollowersList(followersRes.data);
        setTopContributors(contributorsRes.contributors ?? []);
        setFollowingIds(new Set(followingRes.data.map((u) => u.id)));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleToggleFollow = async (targetId: string) => {
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setActionUserId(targetId);
    const isCurrentlyFollowing = followingIds.has(targetId);
    try {
      if (isCurrentlyFollowing) {
        await followService.unfollow(targetId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
        setFollowingList((prev) => prev.filter((u) => u.id !== targetId));
      } else {
        await followService.follow(targetId);
        setFollowingIds((prev) => new Set(prev).add(targetId));
      }
    } finally {
      setActionUserId(null);
    }
  };

  // Filter functions
  const filteredFollowing = followingList.filter(
    (u) => !searchQuery.trim() || u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFollowers = followersList.filter(
    (u) => !searchQuery.trim() || u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredContributors = topContributors.filter(
    (c) =>
      !searchQuery.trim() ||
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="following" />

      <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 max-w-[960px] mx-auto w-full pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Cộng đồng & Kết nối
          </h1>
          <p className="text-[#F15B29] font-semibold text-sm mt-1">
            {isLoggedIn
              ? "Khám phá các thành viên tích cực và danh sách theo dõi của bạn"
              : "Khám phá danh sách thành viên tích cực đóng góp hàng đầu"}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("top-contributors")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === "top-contributors"
                ? "bg-[#F15B29] text-white shadow-md shadow-orange-200"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Trophy size={16} />
            Top Contributors
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
              {topContributors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === "following"
                ? "bg-[#F15B29] text-white shadow-md shadow-orange-200"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <UserCheck size={16} />
            Đang theo dõi (Following)
            {!isLoggedIn ? (
              <Lock size={12} className="ml-1 opacity-70" />
            ) : (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                {followingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("followers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
              activeTab === "followers"
                ? "bg-[#F15B29] text-white shadow-md shadow-orange-200"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Users size={16} />
            Người theo dõi (Followers)
            {!isLoggedIn ? (
              <Lock size={12} className="ml-1 opacity-70" />
            ) : (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
                {followersList.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-8 max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "top-contributors"
                ? "Tìm theo tên contributor..."
                : "Tìm theo username..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
          />
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="h-5 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-10 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: Top Contributors (Accessible for everyone) */}
        {!isLoading && activeTab === "top-contributors" && (
          <>
            {filteredContributors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4 bg-white rounded-3xl border border-gray-100">
                <Trophy size={56} className="opacity-40 text-amber-500" />
                <p className="text-lg font-bold text-gray-400">
                  {searchQuery ? "Không tìm thấy đóng góp nào" : "Chưa có danh sách đóng góp"}
                </p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredContributors.map((c) => {
                    const isOwn = user?.id === c.userId;
                    const isFollowing = followingIds.has(c.userId);
                    const isProcessing = actionUserId === c.userId;
                    const initials = c.displayName.slice(0, 2).toUpperCase();

                    const rankMedals: Record<number, { bg: string; icon: string }> = {
                      1: { bg: "bg-amber-100 text-amber-700 border-amber-300", icon: "🥇" },
                      2: { bg: "bg-slate-100 text-slate-700 border-slate-300", icon: "🥈" },
                      3: { bg: "bg-amber-900/10 text-amber-800 border-amber-900/20", icon: "🥉" },
                    };
                    const medal = rankMedals[c.rank];

                    return (
                      <motion.div
                        key={c.userId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center relative"
                      >
                        {/* Rank Badge */}
                        <div
                          className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                            medal ? medal.bg : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {medal ? `${medal.icon} Top ${c.rank}` : `#${c.rank}`}
                        </div>

                        {/* Avatar */}
                        <div
                          className="w-20 h-20 rounded-full mb-3 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-orange-50 mt-2"
                          onClick={() => navigate(isOwn ? "/profile" : `/users/${c.userId}`)}
                        >
                          {c.avatarUrl ? (
                            <img
                              src={toAbsoluteMediaUrl(c.avatarUrl) ?? undefined}
                              alt={c.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                              <span className="text-xl font-extrabold text-[#F15B29]">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <h3
                            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-[#F15B29] transition-colors line-clamp-1"
                            onClick={() => navigate(isOwn ? "/profile" : `/users/${c.userId}`)}
                          >
                            {c.displayName}
                          </h3>
                          <UserPremiumBadge
                            userId={c.userId}
                            username={c.username}
                            isAnonymous={c.isAnonymous}
                            size={18}
                          />
                        </div>

                        {/* Stats Badges */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            {c.contributionScore} điểm
                          </span>
                          {c.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {c.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-5">
                          <span>{c.postsCount} bài viết</span>
                          <span>·</span>
                          <span>{c.upvotesReceived} lượt upvote</span>
                        </div>

                        {/* Actions */}
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => navigate(isOwn ? "/profile" : `/users/${c.userId}`)}
                            className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                          >
                            Xem hồ sơ
                          </button>
                          {!isOwn && (
                            <button
                              onClick={() => void handleToggleFollow(c.userId)}
                              disabled={isProcessing}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 ${
                                isFollowing
                                  ? "bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200"
                                  : "bg-[#F15B29] text-white hover:bg-[#d94a1d] shadow-sm"
                              }`}
                            >
                              {isProcessing ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : isFollowing ? (
                                <>
                                  <UserMinus size={16} />
                                  Hủy
                                </>
                              ) : (
                                <>
                                  <UserPlus size={16} />
                                  Theo dõi
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {/* Tab 2: Following */}
        {!isLoading && activeTab === "following" && (
          <>
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F15B29] flex items-center justify-center mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Đăng nhập để xem danh sách đang theo dõi
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6 font-medium">
                  Tạo tài khoản hoặc đăng nhập để theo dõi các tác giả yêu thích và xem danh sách
                  tại đây.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-6 py-2.5 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            ) : filteredFollowing.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4 bg-white rounded-3xl border border-gray-100">
                <Users size={56} className="opacity-40" />
                <p className="text-lg font-bold text-gray-400">
                  {searchQuery ? "Không tìm thấy người dùng" : "Chưa theo dõi ai"}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-gray-400 font-medium">
                    Khám phá và theo dõi những người dùng khác!
                  </p>
                )}
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredFollowing.map((u) => {
                    const initials = u.username.slice(0, 2).toUpperCase();
                    const isProcessing = actionUserId === u.id;
                    return (
                      <motion.div
                        key={u.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                      >
                        <div
                          className="w-20 h-20 rounded-full mb-4 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-orange-50"
                          onClick={() => navigate(`/users/${u.id}`)}
                        >
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                              <span className="text-xl font-extrabold text-[#F15B29]">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-1 mb-1">
                          <h3
                            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-[#F15B29] transition-colors"
                            onClick={() => navigate(`/users/${u.id}`)}
                          >
                            {u.username}
                          </h3>
                          <UserPremiumBadge userId={u.id} username={u.username} size={18} />
                        </div>
                        <p className="text-sm text-gray-400 font-medium mb-5">{u.email}</p>

                        <div className="w-full flex gap-3">
                          <button
                            onClick={() => navigate(`/users/${u.id}`)}
                            className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                          >
                            Hồ sơ
                          </button>
                          <button
                            onClick={() => void handleToggleFollow(u.id)}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-600 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <UserMinus size={16} />
                            )}
                            {isProcessing ? "Đang hủy..." : "Hủy theo dõi"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {/* Tab 3: Followers */}
        {!isLoading && activeTab === "followers" && (
          <>
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F15B29] flex items-center justify-center mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Đăng nhập để xem danh sách người theo dõi
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6 font-medium">
                  Tạo tài khoản hoặc đăng nhập để quản lý danh sách những người đang theo dõi bạn.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-6 py-2.5 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            ) : filteredFollowers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4 bg-white rounded-3xl border border-gray-100">
                <Users size={56} className="opacity-40" />
                <p className="text-lg font-bold text-gray-400">
                  {searchQuery ? "Không tìm thấy người theo dõi" : "Chưa có ai theo dõi bạn"}
                </p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredFollowers.map((u) => {
                    const initials = u.username.slice(0, 2).toUpperCase();
                    const isFollowing = followingIds.has(u.id);
                    const isProcessing = actionUserId === u.id;
                    const isOwn = user?.id === u.id;

                    return (
                      <motion.div
                        key={u.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                      >
                        <div
                          className="w-20 h-20 rounded-full mb-4 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-orange-50"
                          onClick={() => navigate(isOwn ? "/profile" : `/users/${u.id}`)}
                        >
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                              <span className="text-xl font-extrabold text-[#F15B29]">
                                {initials}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-1 mb-1">
                          <h3
                            className="text-lg font-bold text-gray-900 cursor-pointer hover:text-[#F15B29] transition-colors"
                            onClick={() => navigate(isOwn ? "/profile" : `/users/${u.id}`)}
                          >
                            {u.username}
                          </h3>
                          <UserPremiumBadge userId={u.id} username={u.username} size={18} />
                        </div>
                        <p className="text-sm text-gray-400 font-medium mb-5">{u.email}</p>

                        <div className="w-full flex gap-3">
                          <button
                            onClick={() => navigate(isOwn ? "/profile" : `/users/${u.id}`)}
                            className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                          >
                            Hồ sơ
                          </button>
                          {!isOwn && (
                            <button
                              onClick={() => void handleToggleFollow(u.id)}
                              disabled={isProcessing}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 ${
                                isFollowing
                                  ? "bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200"
                                  : "bg-[#F15B29] text-white hover:bg-[#d94a1d] shadow-sm"
                              }`}
                            >
                              {isProcessing ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : isFollowing ? (
                                <>
                                  <UserMinus size={16} />
                                  Hủy
                                </>
                              ) : (
                                <>
                                  <UserPlus size={16} />
                                  Theo dõi
                                </>
                              )}
                            </button>
                          )}
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
