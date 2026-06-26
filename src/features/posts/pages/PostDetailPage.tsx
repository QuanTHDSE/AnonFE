import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Calendar,
  Download,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Pencil,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useAuthorAvatar } from "@/shared/hooks/useAuthorAvatar";
import { postService } from "@/services/postService";
import { bookmarkService } from "@/services/bookmarkService";
import { CommentSection } from "@/features/posts/components/CommentSection";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { FeedPostItem } from "@/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [post, setPost] = useState<FeedPostItem | null>(null);
  const fetchedAvatar = useAuthorAvatar(post?.isAnonymous ? null : post?.authorId);
  // Prefer the API avatar (anon-image for anonymous posts, real avatar otherwise).
  const authorAvatar = post?.author?.avatar ?? fetchedAvatar;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    postService
      .getPostById(id)
      .then((data) => {
        setPost(data);
        setCommentsCount(data.commentsCount);
        setLikesCount(data.likesCount);
        if (data.hasUpvoted !== undefined) setHasUpvoted(data.hasUpvoted);
        if (isLoggedIn) {
          void bookmarkService.checkBookmark(id).then(setIsBookmarked);
        }
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Không tìm thấy bài viết."),
      )
      .finally(() => setIsLoading(false));
  }, [id, isLoggedIn]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(id);
      navigate("/");
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setError(err instanceof Error ? err.message : "Xóa bài viết thất bại.");
    }
  };

  const handleUpvote = async () => {
    if (!id || isUpvoting || !isLoggedIn) return;
    setIsUpvoting(true);
    // Optimistic update
    setHasUpvoted((prev) => !prev);
    setLikesCount((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    try {
      await postService.upvotePost(id);
    } catch {
      // Revert on error
      setHasUpvoted((prev) => !prev);
      setLikesCount((prev) => (hasUpvoted ? prev + 1 : prev - 1));
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleBookmark = async () => {
    if (!id || isBookmarking) return;
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setIsBookmarking(true);
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        await bookmarkService.addBookmark(id);
      } else {
        await bookmarkService.removeBookmark(id);
      }
    } catch {
      setIsBookmarked(!next);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="home" />

      <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 max-w-[900px] mx-auto w-full">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors p-2 -ml-2 rounded-xl group mb-8"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold hidden sm:block">Quay lại</span>
        </button>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-100" />
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="h-4 bg-gray-100 rounded w-4/6" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
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

        {/* Post content */}
        {!isLoading &&
          post &&
          (() => {
            const images = post.images ?? [];
            const files = (post.media ?? []).filter((m) => m.mediaType === "File");
            const tags = post.tags ?? [];
            return (
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pb-20"
              >
                {/* Image gallery */}
                {images.length > 0 && (
                  <div className="mb-8">
                    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <ImageWithFallback
                        src={images[selectedImage]}
                        alt={post.title}
                        className="w-full max-h-[560px] object-contain"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                        {images.map((src, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                              selectedImage === idx
                                ? "border-[#F15B29] shadow-md shadow-orange-100"
                                : "border-gray-100 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={src}
                              alt={`thumb-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
                  {/* Header: author + meta */}
                  <div className="flex items-start justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        {authorAvatar ? (
                          <img
                            src={authorAvatar}
                            alt={post.author?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {post.isAnonymous ? "Ẩn danh" : (post.author?.name ?? "Ẩn danh")}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
                          <Calendar size={12} />
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold px-3 py-1.5 bg-orange-50 text-[#F15B29] rounded-full border border-orange-100">
                        {post.subject?.iconEmoji} {post.subject?.name ?? "—"}
                      </span>
                      {user?.name === post.author?.name && !post.isAnonymous && (
                        <>
                          <button
                            onClick={() => navigate(`/posts/${post.id}/edit`)}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 hover:text-[#F15B29] hover:bg-orange-50 border border-gray-200 hover:border-[#F15B29]/30 rounded-xl transition-all"
                          >
                            <Pencil size={15} />
                            Sửa
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-600 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-all"
                          >
                            <Trash2 size={15} />
                            Xóa
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => void handleBookmark()}
                        disabled={isBookmarking}
                        className={`p-2 transition-colors rounded-xl hover:bg-orange-50 disabled:opacity-50 ${
                          isBookmarked ? "text-[#F15B29]" : "text-gray-400 hover:text-[#F15B29]"
                        }`}
                        title={isBookmarked ? "Bỏ lưu" : "Lưu bài viết"}
                      >
                        <Bookmark size={20} className={isBookmarked ? "fill-[#F15B29]" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {/* Content */}
                  <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap mb-6">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-orange-50 border border-orange-100 text-[#F15B29] text-sm font-bold rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* File attachments */}
                  {files.length > 0 && (
                    <div className="flex flex-col gap-2 mb-8">
                      {files.map((media) => (
                        <a
                          key={media.id}
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50/50 rounded-2xl border border-gray-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <FileText size={18} className="text-[#F15B29]" />
                          </div>
                          <span className="flex-1 text-sm font-semibold text-gray-700 truncate">
                            {media.fileName ?? "Tệp đính kèm"}
                          </span>
                          <Download
                            size={18}
                            className="text-gray-400 group-hover:text-[#F15B29] transition-colors shrink-0"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => void handleUpvote()}
                      disabled={isUpvoting || !isLoggedIn}
                      className={`flex items-center gap-2 transition-colors group disabled:cursor-default ${
                        hasUpvoted ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                      title={isLoggedIn ? undefined : "Đăng nhập để upvote"}
                    >
                      <Heart
                        size={22}
                        className={`transition-all ${hasUpvoted ? "fill-red-500" : "group-hover:fill-red-500"}`}
                      />
                      <span className="font-bold">{likesCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageSquare size={22} />
                      <span className="font-bold">{commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto">
                      <Share2 size={22} />
                      <span className="font-bold text-sm">Chia sẻ</span>
                    </button>
                  </div>
                </div>
                {/* Comment Section */}
                <CommentSection
                  postId={post.id}
                  initialCount={post.commentsCount}
                  onTotalChange={setCommentsCount}
                />
              </motion.article>
            );
          })()}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">Xóa bài viết?</h2>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 font-extrabold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Xóa
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
