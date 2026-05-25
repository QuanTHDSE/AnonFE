import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronUp,
  Clock,
  Heart,
  Medal,
  MessageSquare,
  Search,
  Trophy,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { filterLeaderboardPosts, leaderboardService } from "@/services/leaderboardService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { LeaderboardPost } from "@/types";

const LeaderboardCard = ({ post }: { post: LeaderboardPost }) => {
  const isTop3 = post.rank <= 3;

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case 2:
        return "bg-gray-100 text-gray-500 border-gray-200";
      case 3:
        return "bg-orange-50 text-orange-600 border-orange-200";
      default:
        return "bg-white text-gray-400 border-gray-100";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} className="text-yellow-500" />;
      case 2:
        return <Medal size={24} className="text-gray-400" />;
      case 3:
        return <Medal size={24} className="text-orange-500" />;
      default:
        return <span className="font-bold text-lg">{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: post.rank * 0.1 }}
      className={`relative bg-white rounded-3xl border ${isTop3 ? "border-[#F15B29]/20 shadow-lg shadow-orange-100/40" : "border-gray-100 shadow-sm"} p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow group`}
    >
      {/* Rank Indicator */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${getRankColors(post.rank)}`}
      >
        {getRankIcon(post.rank)}
      </div>

      {/* Post Thumbnail & Info */}
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <ImageWithFallback
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{post.author.name}</span>
            <span className="text-gray-300 mx-1">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {post.timeAgo}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end px-4 md:px-0 border-t border-gray-100 md:border-t-0 pt-4 md:pt-0">
        <div className="flex flex-col items-center md:items-end">
          <span className="text-sm text-gray-500 font-medium mb-1">Likes</span>
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500 fill-rose-500" />
            <span className="font-extrabold text-xl text-gray-900">
              {post.likes.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <span className="text-sm text-gray-500 font-medium mb-1">Comments</span>
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            <span className="font-bold text-lg text-gray-700">
              {post.comments.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center w-12">
          {post.trend === "up" && <ChevronUp size={24} className="text-green-500" />}
          {post.trend === "down" && <ChevronUp size={24} className="text-red-500 rotate-180" />}
          {post.trend === "same" && <div className="w-4 h-1 bg-gray-300 rounded-full" />}
        </div>
      </div>
    </motion.div>
  );
};

export function LeaderboardView() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [categories, setCategories] = useState<string[]>([]);
  const [posts, setPosts] = useState<LeaderboardPost[]>([]);

  useEffect(() => {
    void leaderboardService.getCategories().then(setCategories);
    void leaderboardService.getCurrentLeaderboard().then(setPosts);
  }, []);

  const filteredPosts = filterLeaderboardPosts(posts, searchQuery, selectedCategory);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="leaderboard" />
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full pt-6 px-4 md:px-8 lg:px-12">
        {/* Top Bar / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 sticky top-0 bg-[#fafafa]/90 backdrop-blur-md z-40 py-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp size={28} className="text-[#F15B29]" strokeWidth={3} />
              <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight">
                Top Posts
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-sm xl:text-base">
              Các bài viết có lượt thích cao nhất trong tháng này.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 xl:gap-6">
            <div className="relative group flex-1 md:flex-none">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm font-medium"
              />
            </div>

            <div className="flex items-center gap-2 xl:gap-3">
              <button
                onClick={() => (isLoggedIn ? navigate("/chat") : navigate("/signin"))}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm"
              >
                <MessageSquare size={20} />
              </button>
              <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm">
                <Bell size={20} />
              </button>
              <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
              <div className="flex gap-2 items-center">
                {isLoggedIn ? (
                  <>
                    {/* Nút đăng bài ban đầu đã bị loại bỏ vì đã được chuyển sang sidebar */}

                    {/* User Profile Info */}
                    <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#F15B29]">
                        <User size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 hidden sm:block">
                        {user?.name ?? "User"}
                      </span>
                    </div>

                    <button
                      onClick={logout}
                      className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-4 xl:px-6 py-2.5 text-sm xl:text-base font-bold text-[#F15B29] hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-[#F15B29] text-white shadow-md shadow-orange-100"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#F15B29] hover:text-[#F15B29]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <main className="pb-20">
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <LeaderboardCard key={post.id} post={post} />
            ))}

            {filteredPosts.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                <p className="text-lg font-medium">
                  Không tìm thấy bài viết nào phù hợp với "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
