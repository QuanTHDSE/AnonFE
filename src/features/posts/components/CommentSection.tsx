import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  CornerDownRight,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { commentService, type Comment } from "@/services/commentService";
import { useAuthorAvatar } from "@/shared/hooks/useAuthorAvatar";
import { Link, useNavigate } from "react-router";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function AuthorAvatar({ author, size = 8 }: { author?: Comment["author"]; size?: number }) {
  const fetched = useAuthorAvatar(author?.avatar ? null : author?.id);
  const avatar = author?.avatar ?? fetched;
  const cls = `w-${size} h-${size} rounded-full object-cover border border-gray-100`;
  if (avatar) return <img src={avatar} alt={author?.name} className={cls} />;
  const initials = author?.name?.slice(0, 2).toUpperCase() ?? "??";
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-100 flex items-center justify-center shrink-0`}
    >
      <span
        className="text-xs font-extrabold text-[#F15B29]"
        style={{ fontSize: size < 8 ? 10 : 12 }}
      >
        {initials}
      </span>
    </div>
  );
}

// ─── Comment Input ────────────────────────────────────────────────────────────

function CommentInput({
  postId,
  parentId,
  placeholder,
  onSubmitted,
  onCancel,
  autoFocus,
}: {
  postId: string;
  parentId?: string | null;
  placeholder?: string;
  onSubmitted: (comment: Comment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const { user, isLoggedIn, userAvatarUrl } = useAuth();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <Users size={18} className="text-gray-400 shrink-0" />
        <p className="text-sm text-gray-500 font-medium">
          <Link to="/signin" className="text-[#F15B29] font-bold hover:underline">
            Đăng nhập
          </Link>{" "}
          để bình luận
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const comment = await commentService.createComment({
        postId,
        content: content.trim(),
        isAnonymous,
        parentId: parentId ?? null,
      });
      // API may return author with null/empty name — always ensure name is set
      const enriched: Comment = {
        ...comment,
        author: isAnonymous
          ? null
          : {
              id: comment.author?.id ?? user!.id,
              name: comment.author?.name || user!.name,
              avatar: comment.author?.avatar ?? userAvatarUrl ?? undefined,
            },
      };
      setContent("");
      onSubmitted(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi bình luận thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void handleSubmit();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <AuthorAvatar
          author={
            isAnonymous
              ? null
              : { id: user!.id, name: user!.name, avatar: userAvatarUrl ?? undefined }
          }
          size={9}
        />
        <div className="flex-1 space-y-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? "Viết bình luận... (Ctrl+Enter để gửi)"}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setIsAnonymous((v) => !v)}
                className={`w-8 h-5 rounded-full relative transition-colors ${isAnonymous ? "bg-[#F15B29]" : "bg-gray-200"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-3.5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-xs font-bold text-gray-500">Ẩn danh</span>
            </label>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Huỷ
                </button>
              )}
              <button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F15B29] text-white text-xs font-extrabold rounded-xl hover:bg-[#d94a1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-100"
              >
                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Single Comment ───────────────────────────────────────────────────────────

function CommentItem({
  comment,
  postId,
  currentUserId,
  depth,
  onDeleted,
  onUpdated,
  onReplied,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  depth: number;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Comment) => void;
  onReplied: (reply: Comment, parentId: string) => void;
}) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [editError, setEditError] = useState("");

  const isOwner = currentUserId && !comment.isAnonymous && comment.author?.id === currentUserId;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    setEditError("");
    try {
      const updated = await commentService.updateComment(comment.id, editContent.trim());
      onUpdated({ ...comment, ...updated, content: editContent.trim() });
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await commentService.deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      setIsDeleting(false);
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting) return;
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    // Optimistic update
    const next = !hasUpvoted;
    setHasUpvoted(next);
    setLikesCount((n) => (next ? n + 1 : n - 1));
    setIsUpvoting(true);
    try {
      await commentService.upvoteComment(comment.id);
    } catch {
      // Revert on error
      setHasUpvoted(!next);
      setLikesCount((n) => (next ? n - 1 : n + 1));
    } finally {
      setIsUpvoting(false);
    }
  };

  const authorName = comment.isAnonymous ? "Ẩn danh" : (comment.author?.name ?? "Người dùng");
  const replies = comment.replies ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? "ml-8 pl-4 border-l-2 border-gray-100" : ""}`}
    >
      <div className="flex gap-3">
        {comment.isAnonymous ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Users size={15} className="text-gray-400" />
          </div>
        ) : (
          <AuthorAvatar author={comment.author} size={8} />
        )}

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 mb-1">
            {!comment.isAnonymous && comment.author ? (
              <Link
                to={`/users/${comment.author.id}`}
                className="text-sm font-bold text-gray-900 hover:text-[#F15B29] transition-colors"
              >
                {authorName}
              </Link>
            ) : (
              <span className="text-sm font-bold text-gray-500">{authorName}</span>
            )}
            <span className="text-xs text-gray-400 font-medium">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-300 font-medium">(đã sửa)</span>
            )}
          </div>

          {/* Content or Edit */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                autoFocus
                className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium resize-none"
              />
              {editError && <p className="text-xs font-bold text-red-500">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => void handleSaveEdit()}
                  disabled={isSaving || !editContent.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F15B29] text-white text-xs font-bold rounded-lg hover:bg-[#d94a1d] transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={12} className="animate-spin" />}
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                    setEditError("");
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Huỷ
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => void handleUpvote()}
                disabled={isUpvoting}
                className={`flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-50 ${
                  hasUpvoted ? "text-[#F15B29]" : "text-gray-400 hover:text-[#F15B29]"
                }`}
              >
                <ThumbsUp size={13} className={hasUpvoted ? "fill-[#F15B29]" : ""} />
                <span>{likesCount}</span>
              </button>
              {depth < 2 && (
                <button
                  onClick={() => setShowReply((v) => !v)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#F15B29] transition-colors"
                >
                  <CornerDownRight size={13} />
                  Trả lời
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#F15B29] transition-colors"
                  >
                    <Pencil size={12} />
                    Sửa
                  </button>
                  <button
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Xóa
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply Input */}
          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <CommentInput
                  postId={postId}
                  parentId={comment.id}
                  placeholder="Viết trả lời..."
                  autoFocus
                  onSubmitted={(reply) => {
                    onReplied(reply, comment.id);
                    setShowReply(false);
                  }}
                  onCancel={() => setShowReply(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 text-xs font-bold text-[#F15B29] mb-2"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform ${showReplies ? "rotate-180" : ""}`}
                />
                {showReplies ? "Ẩn" : "Xem"} {replies.length} trả lời
              </button>
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        currentUserId={currentUserId}
                        depth={depth + 1}
                        onDeleted={(rid) =>
                          onUpdated({
                            ...comment,
                            replies: replies.filter((r) => r.id !== rid),
                          })
                        }
                        onUpdated={(updated) =>
                          onUpdated({
                            ...comment,
                            replies: replies.map((r) => (r.id === updated.id ? updated : r)),
                          })
                        }
                        onReplied={(newReply) =>
                          onUpdated({
                            ...comment,
                            replies: [...replies, newReply],
                          })
                        }
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Comment Section ─────────────────────────────────────────────────────

export function CommentSection({
  postId,
  initialCount,
  onTotalChange,
}: {
  postId: string;
  initialCount: number;
  onTotalChange?: (count: number) => void;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    onTotalChange?.(total);
  }, [total]);

  const loadComments = async (p: number, append: boolean) => {
    if (p === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await commentService.getComments(postId, p, 10);
      setComments((prev) => (append ? [...prev, ...res.comments] : res.comments));
      setTotal(res.total || res.comments.length);
      setTotalPages(res.totalPages || 1);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    void loadComments(1, false);
  }, [postId]);

  const handleNewComment = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
    setTotal((n) => n + 1);
  };

  const handleDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setTotal((n) => Math.max(0, n - 1));
  };

  const handleUpdated = (updated: Comment) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleReplied = (reply: Comment, parentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c)),
    );
    setTotal((n) => n + 1);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    void loadComments(next, true);
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-[#F15B29]" />
        <h2 className="text-lg font-extrabold text-gray-900">
          Bình luận {total > 0 && <span className="text-gray-400 font-bold">({total})</span>}
        </h2>
      </div>

      {/* Input */}
      <div className="mb-8">
        <CommentInput postId={postId} onSubmitted={handleNewComment} />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-300">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={user?.id}
                depth={0}
                onDeleted={handleDeleted}
                onUpdated={handleUpdated}
                onReplied={handleReplied}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load more */}
      {!isLoading && page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:border-[#F15B29] hover:text-[#F15B29] transition-all disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <ChevronDown size={15} />
                Xem thêm bình luận
              </>
            )}
          </button>
        </div>
      )}

      {/* Close icon for cancel edit anywhere */}
      <X className="hidden" />
    </section>
  );
}
