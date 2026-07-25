import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Bookmark,
  Facebook,
  FileText,
  Flame,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { postService, type TrendingTag } from "@/services/postService";
import { bookmarkService } from "@/services/bookmarkService";
import { commentService } from "@/services/commentService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { PremiumBadge } from "@/shared/components/PremiumBadge";
import { SubscriptionPeekDialog } from "@/shared/components/SubscriptionPeekDialog";
import { usePostAvatar } from "@/shared/hooks/usePostAvatar";
import { getUserPremium, userService, type TopContributor } from "@/services/userService";
import { PostRating } from "@/features/posts/components/PostRating";
import type { FeedPostItem, Subject } from "@/types";
import { searchService, type SearchUserItem } from "@/services/searchService";
import { SearchDropdown } from "@/shared/components/layout/SearchDropdown";

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
  const authorAvatar = usePostAvatar(post.authorId, post.isAnonymous, post.author?.avatar);
  const authorInitials = post.author?.name?.slice(0, 2).toUpperCase() ?? "??";

  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasUpvoted, setHasUpvoted] = useState(post.hasUpvoted ?? false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => bookmarkedPostIds.has(post.id));
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [subPeekOpen, setSubPeekOpen] = useState(false);

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
      className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow mb-8 max-w-[700px] w-full relative"
    >
      {!post.isAnonymous && post.author && (
        <SubscriptionPeekDialog
          userId={post.author.id}
          displayName={post.author.name}
          open={subPeekOpen}
          onOpenChange={setSubPeekOpen}
        />
      )}

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
              <div className="flex items-center gap-1">
                <Link
                  to={`/users/${post.author.id}`}
                  className="font-semibold text-gray-900 hover:text-[#F15B29] transition-colors"
                >
                  {post.author.name}
                </Link>
                {premiumUserIds.has(post.author.id) && (
                  <button
                    type="button"
                    onClick={() => setSubPeekOpen(true)}
                    className="inline-flex hover:opacity-80 transition-opacity"
                    title="Xem gói đăng ký"
                  >
                    <PremiumBadge />
                  </button>
                )}
              </div>
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
          <PostRating
            postId={post.id}
            initialAverageRating={post.averageRating}
            initialRatingsCount={post.ratingsCount}
            initialMyStars={post.myStars}
          />
          <button className="text-gray-500 hover:text-green-500 transition-colors ml-auto">
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
  const [trends, setTrends] = useState<TrendingTag[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);
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

  // The feed API doesn't return premium status, so resolve it per unique author
  // (own user is included from auth context). Each author is fetched + cached
  // once via getUserPremium; results populate the badge set asynchronously.
  const [premiumUserIds, setPremiumUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = new Set<string>();
    for (const post of posts) {
      if (!post.isAnonymous && post.author?.id) ids.add(post.author.id);
    }
    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        [...ids].map(async (id) => [id, await getUserPremium(id)] as const),
      );
      if (cancelled) return;
      const set = new Set<string>();
      if (isPremium && user?.id) set.add(user.id);
      for (const [id, prem] of entries) {
        if (prem) set.add(id);
      }
      setPremiumUserIds(set);
    })();
    return () => {
      cancelled = true;
    };
  }, [posts, isPremium, user?.id]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageUsers, setPageUsers] = useState<SearchUserItem[]>([]);
  const [searchTab, setSearchTab] = useState<"all" | "posts" | "users">("all");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPosts = useCallback(async (searchVal: string, pageNum: number, append: boolean) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      if (searchVal && searchVal.trim()) {
        const res = await searchService.searchAll(searchVal.trim(), 20);
        setPosts(res.posts);
        setPageUsers(res.users);
        setTotalPages(1);
      } else {
        setPageUsers([]);
        const res = await postService.getPosts({
          search: undefined,
          page: pageNum,
          pageSize: PAGE_SIZE,
        });
        setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
        setTotalPages(res.totalPages);
      }
    } catch {
      if (!append) {
        setPosts([]);
        setPageUsers([]);
      }
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
    void postService
      .getTrendingTags()
      .then(setTrends)
      .catch(() => {});

    void postService
      .getSubjects({ pageSize: 15 })
      .then((res) => setSubjects(res.subjects ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoadingContributors(true);
    userService
      .getTopContributors(5)
      .then((res) => setTopContributors(res.contributors ?? []))
      .catch(() => {})
      .finally(() => setIsLoadingContributors(false));
  }, []);

  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [isSearchingDropdown, setIsSearchingDropdown] = useState(false);
  const [dropdownPosts, setDropdownPosts] = useState<FeedPostItem[]>([]);
  const [dropdownUsers, setDropdownUsers] = useState<SearchUserItem[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!val.trim()) {
      setSearchDropdownOpen(false);
      setSearch("");
      return;
    }

    setIsSearchingDropdown(true);
    setSearchDropdownOpen(true);

    searchTimer.current = setTimeout(async () => {
      try {
        const res = await searchService.searchAll(val, 5);
        setDropdownPosts(res.posts);
        setDropdownUsers(res.users);
      } catch {
        setDropdownPosts([]);
        setDropdownUsers([]);
      } finally {
        setIsSearchingDropdown(false);
      }
    }, 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearchDropdownOpen(false);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      const val = searchInput.trim();
      setSearch(val);
      (e.target as HTMLInputElement).blur();
    }
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
              <div ref={searchContainerRef} className="relative group flex-1 md:flex-none">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchInput.trim()) setSearchDropdownOpen(true);
                  }}
                  placeholder="Tìm kiếm bài viết, tác giả..."
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full md:w-64 xl:w-80 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm"
                />

                <SearchDropdown
                  isOpen={searchDropdownOpen}
                  isLoading={isSearchingDropdown}
                  query={searchInput}
                  posts={dropdownPosts}
                  users={dropdownUsers}
                  onClose={() => setSearchDropdownOpen(false)}
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex flex-wrap items-center gap-2">
                  {search ? (
                    <>
                      <span>Kết quả cho "{search}"</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSearchInput("");
                          setSearchDropdownOpen(false);
                        }}
                        className="text-xs bg-gray-200 hover:bg-rose-100 hover:text-rose-600 font-bold px-3 py-1 rounded-full transition-colors"
                      >
                        Xóa tìm kiếm ✕
                      </button>
                    </>
                  ) : (
                    "Recommended for you"
                  )}
                </h2>
                {search && (
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Tìm thấy {posts.length} bài viết và {pageUsers.length} tác giả
                  </p>
                )}
              </div>

              {search && (
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl text-xs font-bold text-gray-600 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSearchTab("all")}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      searchTab === "all" ? "bg-white text-[#F15B29] shadow-sm" : "hover:text-gray-900"
                    }`}
                  >
                    Tất cả ({posts.length + pageUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab("posts")}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      searchTab === "posts" ? "bg-white text-[#F15B29] shadow-sm" : "hover:text-gray-900"
                    }`}
                  >
                    Bài viết ({posts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab("users")}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      searchTab === "users" ? "bg-white text-[#F15B29] shadow-sm" : "hover:text-gray-900"
                    }`}
                  >
                    Tác giả ({pageUsers.length})
                  </button>
                </div>
              )}
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

            {/* Feed Grid & Users Grid */}
            {!isLoading && (
              <>
                {/* On-page Search Users Section */}
                {search && (searchTab === "all" || searchTab === "users") && pageUsers.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users size={16} className="text-[#F15B29]" />
                      Tác giả / Người dùng ({pageUsers.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {pageUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => navigate(`/users/${u.id}`)}
                          className="bg-white rounded-3xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#F15B29] overflow-hidden flex-shrink-0">
                              {u.avatarUrl ? (
                                <ImageWithFallback
                                  src={u.avatarUrl}
                                  alt={u.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={20} strokeWidth={2.5} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors truncate">
                                {u.username}
                              </h4>
                              <p className="text-xs text-gray-400 truncate">@{u.anonAlias}</p>
                              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                {u.followerCount} người theo dõi
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* On-page Search Posts Section */}
                {(searchTab === "all" || searchTab === "posts") && (
                  <>
                    {search && pageUsers.length > 0 && posts.length > 0 && (
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-[#F15B29]" />
                        Bài viết ({posts.length})
                      </h3>
                    )}

                    {posts.length === 0 && (searchTab === "posts" || (searchTab === "all" && pageUsers.length === 0)) ? (
                      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Search size={48} className="mb-4 opacity-30" />
                        <p className="font-bold text-lg">Không tìm thấy kết quả nào</p>
                        {search && <p className="text-sm mt-1">Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm</p>}
                      </div>
                    ) : (
                      posts.length > 0 && (
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
                      )
                    )}
                  </>
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
          {/* Top Contributors Card */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-6 xl:p-8 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  Top Contributors
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Thành viên tích cực tháng này</p>
              </div>
            </div>

            {isLoadingContributors ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-24" />
                      <div className="h-2.5 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topContributors.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium py-2">
                Chưa có đóng góp nào trong tháng này.
              </p>
            ) : (
              <div className="space-y-4">
                {topContributors.map((c) => {
                  const isOwn = user?.id === c.userId;
                  const profileUrl = isOwn ? "/profile" : `/users/${c.userId}`;
                  const rankMedals: Record<number, { bg: string; text: string }> = {
                    1: { bg: "bg-amber-100 text-amber-700 border-amber-300", text: "🥇" },
                    2: { bg: "bg-slate-100 text-slate-700 border-slate-300", text: "🥈" },
                    3: { bg: "bg-amber-900/10 text-amber-800 border-amber-900/20", text: "🥉" },
                  };
                  const medal = rankMedals[c.rank];

                  return (
                    <div
                      key={c.userId}
                      className="flex items-center justify-between group p-1.5 -mx-1.5 rounded-2xl hover:bg-orange-50/50 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank & Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                            {c.avatarUrl ? (
                              <img
                                src={c.avatarUrl}
                                alt={c.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{c.displayName.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center border shadow-xs ${
                              medal
                                ? medal.bg
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            {medal ? medal.text : c.rank}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0">
                          <Link
                            to={profileUrl}
                            className="font-bold text-sm text-gray-900 hover:text-[#F15B29] transition-colors truncate block"
                          >
                            {c.displayName}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
                            <span>{c.postsCount} bài viết</span>
                            <span>·</span>
                            <span className="text-amber-600 font-bold">{c.contributionScore} điểm</span>
                          </div>
                        </div>
                      </div>

                      {/* Average Rating Badge */}
                      {c.averageRating > 0 && (
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shrink-0">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{c.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Leaderboard Link */}
                <Link
                  to="/leaderboard"
                  className="block text-center text-xs font-bold text-[#F15B29] hover:underline pt-2"
                >
                  Xem toàn bộ Bảng xếp hạng →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-6 xl:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <Flame size={20} className="text-[#F15B29]" />
                  Trending Now
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Chủ đề & thẻ thảo luận HOT</p>
              </div>
            </div>

            {trends.length === 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center gap-2.5 text-xs text-orange-900 font-medium">
                  <Sparkles size={16} className="text-[#F15B29] shrink-0" />
                  <span>Chuyên ngành & Chủ đề nổi bật:</span>
                </div>
                {subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {subjects.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSearchChange(s.name)}
                        className="px-3 py-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-[#F15B29] border border-gray-200 hover:border-orange-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        #{s.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 font-medium py-2">
                    Chưa có xu hướng nào. Hãy thêm thẻ vào bài viết của bạn!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {trends.map((trend, index) => (
                  <button
                    key={trend.tag}
                    onClick={() => handleSearchChange(trend.tag)}
                    className="w-full flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all text-left"
                  >
                    <span className="text-lg font-bold text-gray-200 group-hover:text-[#F15B29] transition-colors w-6 shrink-0">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-gray-700 font-medium italic group-hover:text-[#F15B29] transition-colors truncate">
                        #{trend.tag}
                      </span>
                      <span className="block text-xs text-gray-400 font-medium">
                        {trend.count} bài viết
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <div className="mt-6 bg-gradient-to-br from-[#F15B29] to-[#ff8c69] rounded-[32px] p-6 xl:p-8 text-white relative overflow-hidden shadow-lg shadow-orange-100">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 leading-tight">Join the community!</h3>
              <p className="text-orange-100 text-sm mb-6">
                Create an account to save posts and connect with creators.
              </p>
              <button
                onClick={() => (isLoggedIn ? navigate("/create") : navigate("/signin"))}
                className="w-full py-3 bg-white text-[#F15B29] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg cursor-pointer"
              >
                {isLoggedIn ? "Tạo bài viết mới" : "Get Started"}
              </button>

              {/* Social Links */}
              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs text-orange-100 font-semibold">Theo dõi AnonWorks:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.facebook.com/profile.php?id=61589880516548"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-xs"
                    title="Facebook AnonWorks"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@anon.work7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-xs"
                    title="TikTok AnonWorks"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.33 6.33 0 0 0 6.33-6.33V9.05a8.16 8.16 0 0 0 4.67 1.48V7.08a4.85 4.85 0 0 1-.75-.39z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -top-8 w-24 h-24 bg-black/5 rounded-full blur-xl" />
          </div>

          {/* Footer Links */}
          <div className="mt-8 px-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-gray-400 font-medium">
            <Link to="/privacy" className="hover:text-[#F15B29]">
              Privacy
            </Link>
            <Link to="/policy" className="hover:text-[#F15B29]">
              Policy
            </Link>
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
