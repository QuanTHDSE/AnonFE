import { useEffect, useState } from "react";
import { Loader2, Search, UserMinus, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { followService, type FollowUserItem } from "@/services/followService";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";

export function FollowingView() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [followingList, setFollowingList] = useState<FollowUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    followService
      .getFollowing(user.id, 1, 100)
      .then((res) => setFollowingList(res.data))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!isLoggedIn) return null;

  const handleUnfollow = async (userId: string) => {
    setUnfollowingId(userId);
    try {
      await followService.unfollow(userId);
      setFollowingList((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setUnfollowingId(null);
    }
  };

  const filtered = followingList.filter(
    (u) => !searchQuery.trim() || u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="following" />

      <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 max-w-[960px] mx-auto w-full pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Following</h1>
          <p className="text-[#F15B29] font-semibold text-sm mt-1">Những người bạn đang theo dõi</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo username..."
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

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
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
        )}

        {/* Following grid */}
        {!isLoading && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((u) => {
                const initials = u.username.slice(0, 2).toUpperCase();
                const isUnfollowing = unfollowingId === u.id;
                return (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
                  >
                    {/* Avatar */}
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
                          <span className="text-xl font-extrabold text-[#F15B29]">{initials}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3
                      className="text-lg font-bold text-gray-900 cursor-pointer hover:text-[#F15B29] transition-colors mb-1"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      {u.username}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium mb-5">{u.email}</p>

                    {/* Actions */}
                    <div className="w-full flex gap-3">
                      <button
                        onClick={() => navigate(`/users/${u.id}`)}
                        className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                      >
                        Hồ sơ
                      </button>
                      <button
                        onClick={() => void handleUnfollow(u.id)}
                        disabled={isUnfollowing}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-600 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all disabled:opacity-50"
                      >
                        {isUnfollowing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserMinus size={16} />
                        )}
                        {isUnfollowing ? "Đang hủy..." : "Hủy theo dõi"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
