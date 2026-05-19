import React, { useEffect, useState } from "react";
import {
  Bell,
  Bookmark,
  Heart,
  MessageSquare,
  Search,
  Share2,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { Post } from "@/types";

const PostCard = ({ post }: { post: Post }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-8 max-w-[700px] w-full"
  >
    {/* Post Header */}
    <div className="flex items-center justify-between p-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <div className="text-gray-400">
            <Users size={24} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
          <p className="text-xs text-gray-500 font-medium">{post.time}</p>
        </div>
      </div>
      <button className="text-gray-400 hover:text-[#F15B29] transition-colors">
        <Bookmark size={24} />
      </button>
    </div>

    {/* Post Image */}
    <div className="px-6 pb-4">
      <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Post Body */}
    <div className="px-6 pb-6">
      <p className="text-gray-800 font-medium mb-3">{post.caption}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-[#F15B29] font-semibold text-sm hover:underline cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors group">
            <Heart size={20} className="group-hover:fill-red-500" />
            <span className="text-sm font-semibold">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageSquare size={20} />
            <span className="text-sm font-semibold">{post.comments}</span>
          </button>
          <button className="text-gray-500 hover:text-green-500 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <span className="text-sm font-bold text-[#F15B29]">{post.rating}</span>
          <Star size={16} fill="#F15B29" className="text-[#F15B29]" />
        </div>
      </div>
    </div>
  </motion.div>
);

export function HomeView() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<string[]>([]);

  useEffect(() => {
    void postService.getFeedPosts().then(setPosts);
    void postService.getTrends().then(setTrends);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="home" />

      {/* Main Content & Right Sidebar Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        {/* Main Feed Area */}
        <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12">
          {/* Top Bar / Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 sticky top-0 bg-[#fafafa]/90 backdrop-blur-md z-40 py-4">
            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight">
                Explore
              </h1>
              <p className="text-[#F15B29] font-semibold text-sm xl:text-base">
                Discover what's happening today.
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
                  placeholder="Search inspiration..."
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 xl:w-80 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
                />
              </div>

              <div className="flex items-center gap-2 xl:gap-3">
                <button
                  onClick={() => (isLoggedIn ? navigate("/chat") : navigate("/signin"))}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm"
                  title="Messages"
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
                          tranhuu...
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
                    <>
                      <button
                        onClick={() => navigate("/signin")}
                        className="px-4 xl:px-6 py-2.5 text-sm xl:text-base font-bold text-[#F15B29] hover:bg-orange-50 rounded-xl transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate("/register")}
                        className="px-4 xl:px-6 py-2.5 text-sm xl:text-base bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Feed Content */}
          <div className="w-full max-w-[1400px] mx-auto">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900">Recommended for you</h2>
            </div>

            {/* Feed Grid - Multi-column / Masonry Style */}
            <div className="columns-1 lg:columns-2 gap-6 md:gap-8 pb-20">
              {posts.map((post) => (
                <div key={post.id} className="break-inside-avoid w-full">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <aside className="hidden xl:block w-[320px] 2xl:w-[380px] p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 xl:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
              <TrendingUp size={20} className="text-[#F15B29]" />
            </div>

            <div className="space-y-5">
              {trends.map((tag, index) => (
                <div
                  key={tag}
                  className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <span className="text-lg font-bold text-gray-200 group-hover:text-[#F15B29] transition-colors w-6">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="text-gray-700 font-medium italic group-hover:text-[#F15B29] transition-colors truncate">
                    #{tag}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-3.5 bg-orange-50 text-[#F15B29] font-bold rounded-xl hover:bg-orange-100 transition-colors">
              Show more
            </button>
          </div>

          {/* CTA Banner */}
          <div className="mt-6 bg-gradient-to-br from-[#F15B29] to-[#ff8c69] rounded-[32px] p-6 xl:p-8 text-white relative overflow-hidden shadow-lg shadow-orange-100">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 leading-tight">Join the community!</h3>
              <p className="text-orange-100 text-sm mb-6">
                Create an account to save posts and connect with creators.
              </p>
              <button className="w-full py-3 bg-white text-[#F15B29] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                Get Started
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -top-8 w-24 h-24 bg-black/5 rounded-full blur-xl" />
          </div>

          {/* Footer Links */}
          <div className="mt-8 px-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-gray-400 font-medium">
            <a href="#" className="hover:text-[#F15B29]">
              Privacy
            </a>
            <a href="#" className="hover:text-[#F15B29]">
              Terms
            </a>
            <a href="#" className="hover:text-[#F15B29]">
              Cookies
            </a>
            <a href="#" className="hover:text-[#F15B29]">
              About
            </a>
            <p>© 2026 Figma Make</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
