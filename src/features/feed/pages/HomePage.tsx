import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import { bookmarkService } from "@/services/bookmarkService";
import { commentService } from "@/services/commentService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { PremiumBadge } from "@/shared/components/PremiumBadge";
import { useAuthorAvatar } from "@/shared/hooks/useAuthorAvatar";
import type { FeedPostItem } from "@/types";

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

const PostCard = ({
  post,
  premiumUserIds,
  bookmarkedPostIds,
}: {
  post: FeedPostItem;
  premiumUserIds: Set<string>;
  bookmarkedPostIds: Set<string>;
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const authorAvatar = useAuthorAvatar(post.isAnonymous ? null : post.authorId);
  const authorInitials = post.author?.name?.slice(0, 2).toUpperCase() ?? "??";

  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasUpvoted, setHasUpvoted] = useState(post.hasUpvoted ?? false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => bookmarkedPostIds.has(post.id));
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  useEffect(() => {
    setIsBookmarked(bookmarkedPostIds.has(post.id));
  }, [bookmarkedPostIds, post.id]);

  useEffect(() => {
    commentService
      .getComments(post.id, 1, 1)
      .then(({ total }) => setCommentsCount(total))
      .catch(() => {});
  }, [post.id]);

  const images = post.images ?? [];
  const tags = post.tags ?? [];

  const handleUpvote = async () => {
    if (isUpvoting) return;
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setIsUpvoting(true);
    setHasUpvoted((prev) => !prev);
    setLikesCount((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    try {
      await postService.upvotePost(post.id);
    } catch {
      setHasUpvoted((prev) => !prev);
      setLikesCount((prev) => (hasUpvoted ? prev + 1 : prev - 1));
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarking) return;
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setIsBookmarking(true);
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        await bookmarkService.addBookmark(post.id);
      } else {
        await bookmarkService.removeBookmark(post.id);
      }
    } catch {
      setIsBookmarked(!next);
    } finally {
      setIsBookmarking(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-8 max-w-[700px] w-full"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={post.author?.name ?? "avatar"}
                className="w-full h-full object-cover"
              />
            ) : post.isAnonymous ? (
              <div className="text-gray-400">
                <Users size={24} />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <span className="text-sm font-extrabold text-[#F15B29]">{authorInitials}</span>
              </div>
            )}
          </div>
          <div>
            {post.isAnonymous ? (
              <h3 className="font-semibold text-gray-900">{post.author?.name ?? "Ẩn danh"}</h3>
            ) : post.author ? (
              <Link
                to={`/users/${post.author.id}`}
                className="font-semibold text-gray-900 hover:text-[#F15B29] transition-colors flex items-center gap-1"
              >
                {post.author.name}
                {premiumUserIds.has(post.author.id) && <PremiumBadge />}
              </Link>
            ) : (
              <h3 className="font-semibold text-gray-900">Người dùng</h3>
            )}
            <p className="text-xs text-gray-500 font-medium">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-[#F15B29] rounded-full border border-orange-100">
            {post.subject?.iconEmoji} {post.subject?.name ?? "—"}
          </span>
          <button
            onClick={(e) => void handleBookmark(e)}
            disabled={isBookmarking}
            className={`transition-colors disabled:opacity-50 ${
              isBookmarked ? "text-[#F15B29]" : "text-gray-400 hover:text-[#F15B29]"
            }`}
            title={isBookmarked ? "Bỏ lưu" : "Lưu bài viết"}
          >
            <Bookmark size={20} className={isBookmarked ? "fill-[#F15B29]" : ""} />
          </button>
        </div>
      </div>

      {/* Post Image */}
      {images.length > 0 && (
        <Link to={`/posts/${post.id}`} className="block px-6 pb-4">
          <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50">
            <ImageWithFallback
              src={images[0]}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 text-xs font-bold bg-black/50 text-white px-2 py-1 rounded-full">
                +{images.length - 1}
              </span>
            )}
          </div>
        </Link>
      )}

      {/* Post Body */}
      <div className="px-6 pb-6">
        <Link to={`/posts/${post.id}`} className="block group">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#F15B29] transition-colors">
            {post.title}
          </h4>
          <p className="text-gray-600 font-medium text-sm mb-3 line-clamp-3">{post.content}</p>
        </Link>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[#F15B29] font-semibold text-sm hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center pt-4 border-t border-gray-100 gap-6">
          <button
            onClick={() => void handleUpvote()}
            disabled={isUpvoting}
            className={`flex items-center gap-1.5 transition-colors group disabled:cursor-default ${
              hasUpvoted ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart size={20} className={hasUpvoted ? "fill-red-500" : "group-hover:fill-red-500"} />
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageSquare size={20} />
            <span className="text-sm font-semibold">{commentsCount}</span>
          </button>
          <button className="text-gray-500 hover:text-green-500 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PAGE_SIZE = 10;

export function HomeView() {
  const navigate = useNavigate();
  const { isLoggedIn, user, isPremium, logout, userAvatarUrl } = useAuth();

  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [trends, setTrends] = useState<string[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkedPostIds(new Set());
      return;
    }
    bookmarkService
      .getBookmarks({ pageSize: 500 })
      .then((res) => setBookmarkedPostIds(new Set(res.items.map((b) => b.postId))))
      .catch(() => {});
  }, [isLoggedIn]);

  // Build set of premium user IDs: own user + any author with isPremium from API
  const premiumUserIds = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    if (isPremium && user?.id) set.add(user.id);
    for (const post of posts) {
      if (post.author?.id && post.author.isPremium) set.add(post.author.id);
    }
    return set;
  }, [isPremium, user?.id, posts]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPosts = useCallback(async (searchVal: string, pageNum: number, append: boolean) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await postService.getPosts({
        search: searchVal || undefined,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
      setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(search, 1, false);
    setPage(1);
  }, [search, loadPosts]);

  useEffect(() => {
    void postService.getTrends().then(setTrends);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    void loadPosts(search, next, true);
  };

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
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#F15B29] overflow-hidden">
                          {userAvatarUrl ? (
                            <img
                              src={userAvatarUrl}
                              alt={user?.name ?? "avatar"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} strokeWidth={2.5} />
                          )}
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
              <h2 className="text-lg font-extrabold text-gray-900">
                {search ? `Kết quả cho "${search}"` : "Recommended for you"}
              </h2>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
              <div className="columns-1 lg:columns-2 gap-6 md:gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="break-inside-avoid w-full mb-8">
                    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                      <div className="p-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-100 rounded w-16" />
                        </div>
                      </div>
                      <div className="px-6 pb-4">
                        <div className="aspect-square rounded-[24px] bg-gray-100" />
                      </div>
                      <div className="px-6 pb-6 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feed Grid */}
            {!isLoading && (
              <>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Search size={48} className="mb-4 opacity-30" />
                    <p className="font-bold text-lg">Không tìm thấy bài viết nào</p>
                    {search && <p className="text-sm mt-1">Thử từ khóa khác</p>}
                  </div>
                ) : (
                  <div className="columns-1 lg:columns-2 gap-6 md:gap-8 pb-8">
                    {posts.map((post) => (
                      <div key={post.id} className="break-inside-avoid w-full">
                        <PostCard
                          post={post}
                          premiumUserIds={premiumUserIds}
                          bookmarkedPostIds={bookmarkedPostIds}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Load more */}
                {page < totalPages && (
                  <div className="flex justify-center pb-20">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:border-[#F15B29] hover:text-[#F15B29] transition-all shadow-sm disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        "Xem thêm bài viết"
                      )}
                    </button>
                  </div>
                )}
                {page >= totalPages && posts.length > 0 && (
                  <p className="text-center text-sm text-gray-400 font-medium pb-20">
                    Đã hiển thị tất cả bài viết
                  </p>
                )}
              </>
            )}
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
