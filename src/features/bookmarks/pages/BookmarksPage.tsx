import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Heart, Loader2, MessageSquare, Search } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { bookmarkService, type BookmarkPost } from "@/services/bookmarkService";
import { commentService } from "@/services/commentService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useAuthorAvatar } from "@/shared/hooks/useAuthorAvatar";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookmarkCard({
  item,
  onRemove,
}: {
  item: BookmarkPost;
  onRemove: (postId: string) => void;
}) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const authorAvatar = useAuthorAvatar(item.isAnonymous ? null : item.author?.id);
  const authorInitials = item.author?.name?.slice(0, 2).toUpperCase() ?? "??";
  const [commentsCount, setCommentsCount] = useState(item.commentsCount ?? 0);

  useEffect(() => {
    commentService
      .getComments(item.postId, 1, 1)
      .then(({ total }) => setCommentsCount(total))
      .catch(() => {});
  }, [item.postId]);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    try {
      await bookmarkService.removeBookmark(item.postId);
      onRemove(item.postId);
    } catch {
      setRemoving(false);
    }
  };

  const images = item.images ?? [];
  const displayName = item.author?.name ?? (item.isAnonymous ? "Ẩn danh" : "Người dùng");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col cursor-pointer"
      onClick={() => navigate(`/posts/${item.postId}`)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={displayName} className="w-full h-full object-cover" />
            ) : item.isAnonymous ? (
              <span className="text-sm font-extrabold text-[#F15B29]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="text-sm font-extrabold text-[#F15B29]">{authorInitials}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">{displayName}</h3>
            <p className="text-xs text-gray-400">Lưu {formatDate(item.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={(e) => void handleRemove(e)}
          disabled={removing}
          className="text-[#F15B29] hover:bg-orange-50 p-2 rounded-xl transition-colors disabled:opacity-50"
          title="Bỏ lưu"
        >
          {removing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Bookmark size={20} fill="#F15B29" />
          )}
        </button>
      </div>

      {/* Image */}
      {images.length > 0 && (
        <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
          <ImageWithFallback
            src={images[0]}
            alt={item.title ?? "Post"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full font-bold text-gray-900 text-sm shadow-lg">
              Xem bài viết
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {item.title && (
          <h4 className="font-extrabold text-gray-900 text-base mb-1 line-clamp-1">{item.title}</h4>
        )}
        {item.content && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.content}</p>}

        {/* Subject */}
        {item.subject?.name && (
          <span className="self-start text-xs font-bold px-2.5 py-1 bg-orange-50 text-[#F15B29] rounded-full border border-orange-100 mb-3">
            {item.subject.iconEmoji} {item.subject.name}
          </span>
        )}

        {/* Tags */}
        {(item.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(item.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1.5">
            <Heart size={14} />
            <span className="text-xs font-bold">{item.likesCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span className="text-xs font-bold">{commentsCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BookmarksView() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<BookmarkPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE_SIZE = 12;

  const load = useCallback(async (q: string, p: number) => {
    setIsLoading(true);
    try {
      const res = await bookmarkService.getBookmarks({
        search: q || undefined,
        page: p,
        pageSize: PAGE_SIZE,
      });
      setItems(p === 1 ? res.items : (prev) => [...prev, ...res.items]);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      setPage(p);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    void load("", 1);
  }, [isLoggedIn, navigate, load]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void load(q, 1), 400);
  };

  const handleRemove = (postId: string) => {
    setItems((prev) => prev.filter((it) => it.postId !== postId));
    setTotal((t) => t - 1);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="bookmarks" />

      <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full">
        <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 pb-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 sticky top-0 bg-[#fafafa]/90 backdrop-blur-md z-40 py-4">
            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight">
                Đã lưu
              </h1>
              <p className="text-[#F15B29] font-semibold text-sm xl:text-base">
                {total > 0 ? `${total} bài viết đã lưu` : "Chưa có bài viết nào được lưu"}
              </p>
            </div>

            <div className="relative group flex-1 md:flex-none">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm trong bài đã lưu..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 xl:w-80 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
              />
            </div>
          </header>

          {/* Loading skeleton */}
          {isLoading && items.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="h-14 bg-gray-50 border-b border-gray-100" />
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!isLoading || items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {items.map((item) => (
                  <BookmarkCard key={item.id || item.postId} item={item} onRemove={handleRemove} />
                ))}
              </div>

              {/* Empty state */}
              {!isLoading && items.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                  <Bookmark size={48} className="text-gray-200 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Chưa có bài viết được lưu
                  </h3>
                  <p className="mb-6">
                    {searchQuery
                      ? "Không tìm thấy kết quả phù hợp."
                      : "Bấm icon bookmark trên bài viết để lưu lại."}
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
                  >
                    Khám phá bài viết
                  </button>
                </div>
              )}

              {/* Load more */}
              {page < totalPages && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => void load(searchQuery, page + 1)}
                    disabled={isLoading}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-[#F15B29] hover:text-[#F15B29] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Xem thêm
                  </button>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
