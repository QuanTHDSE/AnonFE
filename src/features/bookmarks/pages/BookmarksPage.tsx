import React, { useEffect, useState } from "react";
import { Bell, Bookmark, Heart, MessageSquare, Search, Star, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { filterSavedPosts, postService } from "@/services/postService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { SavedPost } from "@/types";

export function BookmarksView() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    void postService.getSavedPosts().then(setSavedPosts);
  }, []);

  if (!isLoggedIn) return null;

  const removeBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const filteredPosts = filterSavedPosts(savedPosts, searchQuery);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="bookmarks" />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full">
        <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 pb-12">
          {/* Top Bar / Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 sticky top-0 bg-[#fafafa]/90 backdrop-blur-md z-40 py-4">
            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight">
                Saved
              </h1>
              <p className="text-[#F15B29] font-semibold text-sm xl:text-base">
                Inspiration you've collected.
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
                  placeholder="Search saved posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 xl:w-80 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
                />
              </div>

              <div className="flex items-center gap-2 xl:gap-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm"
                >
                  <MessageSquare size={20} />
                </button>
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#F15B29] transition-colors shadow-sm">
                  <Bell size={20} />
                </button>
                <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
                <div className="flex gap-2 items-center">
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
                </div>
              </div>
            </div>
          </header>

          {/* Bookmarks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <Users size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{post.author.name}</h3>
                      <p className="text-xs text-gray-500">Saved {post.savedAt}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => removeBookmark(e, post.id)}
                    className="text-[#F15B29] hover:bg-orange-50 p-2 rounded-xl transition-colors"
                    title="Remove from saved"
                  >
                    <Bookmark size={20} fill="#F15B29" />
                  </button>
                </div>

                {/* Image */}
                <div className="relative aspect-video w-full bg-gray-50 overflow-hidden cursor-pointer">
                  <ImageWithFallback
                    src={post.image}
                    alt="Saved post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-gray-900 text-sm shadow-lg">
                      View Post
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{post.caption}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-gray-500">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <Heart size={16} />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={16} />
                        <span className="text-xs font-bold">{post.comments}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                      <span className="text-xs font-bold text-[#F15B29]">{post.rating}</span>
                      <Star size={12} fill="#F15B29" className="text-[#F15B29]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                <Bookmark size={48} className="text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No saved posts found</h3>
                <p>Try searching for something else or save more posts!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
