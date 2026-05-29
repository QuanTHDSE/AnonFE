import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  FileText,
  Heart,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import { userService, type UserProfile } from "@/services/userService";
import { ImageWithFallback } from "@/shared/components/images/ImageWithFallback";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { FeedPostItem } from "@/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

interface PostCardProps {
  post: FeedPostItem;
  onEdit: () => void;
  onDelete: () => void;
}

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const images = post.images ?? [];
  const tags = post.tags ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {images.length > 0 && (
        <Link to={`/posts/${post.id}`} className="block">
          <div className="relative aspect-video overflow-hidden bg-gray-50">
            <ImageWithFallback
              src={images[0]}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {images.length > 1 && (
              <span className="absolute bottom-2 right-2 text-xs font-bold bg-black/50 text-white px-2 py-0.5 rounded-full">
                +{images.length - 1}
              </span>
            )}
          </div>
        </Link>
      )}

      <div className="p-5">
        {/* Subject + time + actions */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-[#F15B29] rounded-full border border-orange-100 shrink-0">
            {post.subject?.iconEmoji} {post.subject?.name ?? "—"}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-gray-400 font-medium mr-1">
              {formatRelativeTime(post.createdAt)}
            </span>
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100"
              title="Chỉnh sửa"
            >
              <Pencil size={13} />
              Sửa
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Xóa bài viết"
            >
              <Trash2 size={13} />
              Xóa
            </button>
          </div>
        </div>

        <Link to={`/posts/${post.id}`} className="group block mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-[#F15B29] transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">
          {post.content}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-[#F15B29] font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-5 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Heart size={15} />
            <span className="font-semibold">{post.likesCount}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 text-sm">
            <MessageSquare size={15} />
            <span className="font-semibold">{post.commentsCount}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export function ProfileView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([userService.getMe(), postService.getPosts({ pageSize: 100 })])
      .then(([prof, postsRes]) => {
        setProfile(prof);
        setPosts(postsRes.posts.filter((p) => !p.isAnonymous && p.author?.id === user.id));
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await postService.deletePost(confirmDeleteId);
      setPosts((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Xóa bài viết thất bại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmPost = posts.find((p) => p.id === confirmDeleteId);
  const initials =
    profile?.username?.slice(0, 2).toUpperCase() ?? user?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="profile" />

      <main className="flex-1 min-w-0 pt-6 px-4 md:px-8 lg:px-12 max-w-[960px] mx-auto w-full pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors p-2 -ml-2 rounded-xl group mb-8"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold hidden sm:block">Quay lại</span>
        </button>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-4 border-orange-100 flex items-center justify-center">
                  {isLoading ? (
                    <UserRound size={36} className="text-orange-200" />
                  ) : (
                    <span className="text-2xl font-extrabold text-[#F15B29]">{initials}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-40 mx-auto sm:mx-0" />
                  <div className="h-4 bg-gray-100 rounded w-56 mx-auto sm:mx-0" />
                  <div className="h-4 bg-gray-100 rounded w-32 mx-auto sm:mx-0" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                    {profile?.username ?? user?.name}
                  </h1>
                  <p className="text-gray-500 font-medium text-sm mb-1">
                    {profile?.email ?? user?.email}
                  </p>
                  <p className="text-sm text-gray-400 font-medium mb-3">
                    Alias ẩn danh:{" "}
                    <span className="font-bold text-gray-600">{profile?.anonAlias ?? "—"}</span>
                  </p>
                  {profile?.bio && (
                    <p className="text-sm text-gray-600 font-medium mb-3 max-w-md">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <Calendar size={14} />
                      Tham gia {profile ? formatDate(profile.createdAt) : "—"}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-gray-700">
                      <FileText size={14} className="text-[#F15B29]" />
                      {posts.length} bài viết công khai
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts section header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Bài viết của tôi</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              Chỉ hiển thị bài viết công khai (không ẩn danh)
            </p>
          </div>
          {!isLoading && posts.length > 0 && (
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2.5 text-sm font-bold bg-[#F15B29] text-white rounded-xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
            >
              + Tạo bài mới
            </button>
          )}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300 gap-4">
            <FileText size={56} className="opacity-40" />
            <p className="text-lg font-bold text-gray-400">Chưa có bài viết nào</p>
            <p className="text-sm text-gray-400 font-medium">
              Hãy chia sẻ điều gì đó với cộng đồng!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="mt-2 px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
            >
              Tạo bài viết đầu tiên
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={() => navigate(`/posts/${post.id}/edit`)}
                  onDelete={() => setConfirmDeleteId(post.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900">Xóa bài viết?</h2>
                </div>
                <button
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setDeleteError("");
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-gray-500 font-medium mb-2 leading-relaxed text-sm">
                Bài viết{" "}
                <span className="font-bold text-gray-700">&ldquo;{confirmPost?.title}&rdquo;</span>{" "}
                sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </p>

              {deleteError && (
                <p className="mt-3 text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  {deleteError}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setConfirmDeleteId(null);
                    setDeleteError("");
                  }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
