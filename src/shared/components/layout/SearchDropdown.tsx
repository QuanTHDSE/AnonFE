import React, { useState } from "react";
import {
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  User,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import type { SearchUserItem } from "@/services/searchService";
import type { FeedPostItem } from "@/types";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";

interface SearchDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  posts: FeedPostItem[];
  users: SearchUserItem[];
  onClose: () => void;
}

export function SearchDropdown({
  isOpen,
  isLoading,
  query,
  posts,
  users,
  onClose,
}: SearchDropdownProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "users">("all");

  if (!isOpen || !query.trim()) return null;

  const totalResults = posts.length + users.length;

  const handlePostClick = (postId: string) => {
    onClose();
    // Navigate to homepage or post detail if route exists
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleUserClick = (userId: string) => {
    onClose();
    navigate(`/users/${userId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden z-50 max-h-[520px] flex flex-col w-full md:w-[420px] xl:w-[480px]"
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-[#F15B29] shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Tất cả ({totalResults})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "posts"
                  ? "bg-white text-[#F15B29] shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Bài viết ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "users"
                  ? "bg-white text-[#F15B29] shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Tác giả ({users.length})
            </button>
          </div>

          <span className="text-[11px] text-gray-400 font-semibold truncate max-w-[120px]">
            "{query}"
          </span>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-2 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-[#F15B29]">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-sm font-bold">Đang tìm kiếm...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Search size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-bold text-gray-600">Không tìm thấy kết quả</p>
              <p className="text-xs text-gray-400 mt-0.5">Thử tìm bằng từ khóa khác</p>
            </div>
          ) : (
            <>
              {/* Users Section */}
              {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                    <Users size={14} className="text-[#F15B29]" />
                    Tác giả ({users.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleUserClick(u.id)}
                        className="flex items-center justify-between p-2.5 hover:bg-orange-50/60 rounded-2xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F15B29] overflow-hidden flex-shrink-0">
                            {u.avatarUrl ? (
                              <ImageWithFallback
                                src={u.avatarUrl}
                                alt={u.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} strokeWidth={2.5} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors truncate">
                              {u.username}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">
                              @{u.anonAlias} • {u.followerCount} người theo dõi
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                    <FileText size={14} className="text-[#F15B29]" />
                    Bài viết ({posts.length})
                  </div>
                  <div className="space-y-1 mt-1">
                    {posts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handlePostClick(p.id)}
                        className="p-3 hover:bg-orange-50/60 rounded-2xl cursor-pointer transition-colors group border border-transparent hover:border-orange-100"
                      >
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {p.content}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F15B29]" />
                            {p.author?.name ?? "Ẩn danh"}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-rose-500 font-bold">
                              <Heart size={12} className="fill-rose-500" />
                              {p.likesCount}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <MessageSquare size={12} />
                              {p.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {totalResults > 0 && (
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/?search=${encodeURIComponent(query)}`);
              }}
              className="text-xs font-extrabold text-[#F15B29] hover:underline"
            >
              Xem tất cả kết quả cho "{query}" →
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
