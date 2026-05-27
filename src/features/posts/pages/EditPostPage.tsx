import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Send,
  Tag,
  Type,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import type { FeedPostItem } from "@/types";

function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function EditPostView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<FeedPostItem | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // existing images: track which ones to remove
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removeImageUrls, setRemoveImageUrls] = useState<string[]>([]);

  // new images to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    postService
      .getPostById(id)
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setTags(data.tags ?? []);
        setExistingImages(data.images ?? []);
      })
      .catch((err: unknown) =>
        setFetchError(err instanceof Error ? err.message : "Không tìm thấy bài viết."),
      )
      .finally(() => setIsFetching(false));
  }, [id]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleMarkRemove = (url: string) => {
    setRemoveImageUrls((prev) => [...prev, url]);
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map(fileToObjectUrl)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title || !content) return;
    setIsLoading(true);
    setSubmitStatus("idle");
    setErrorMessage("");
    try {
      await postService.updatePost(id, {
        title,
        content,
        tags: tags.length > 0 ? tags : [],
        newImages: newImageFiles.length > 0 ? newImageFiles : undefined,
        removeImageUrls: removeImageUrls.length > 0 ? removeImageUrls : undefined,
      });
      setSubmitStatus("success");
      setTimeout(() => navigate(`/posts/${id}`), 1500);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  const canSubmit = title.trim() && content.trim() && !isLoading;

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <div className="max-w-[800px] mx-auto w-full pt-6 px-4 md:px-8 lg:px-12 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors p-2 -ml-2 rounded-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold hidden sm:block">Quay lại</span>
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Chỉnh sửa bài viết</h1>
          <div className="w-24" />
        </header>

        {/* Fetch loading */}
        {isFetching && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse p-10 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        )}

        {/* Fetch error */}
        {!isFetching && fetchError && (
          <div className="flex flex-col items-center py-20 gap-4 text-red-500">
            <AlertCircle size={40} />
            <p className="font-bold">{fetchError}</p>
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#F15B29] font-bold">
              Quay lại
            </button>
          </div>
        )}

        {/* Form */}
        {!isFetching && post && (
          <>
            {/* Toast */}
            <AnimatePresence>
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold"
                >
                  <CheckCircle size={20} />
                  Cập nhật thành công! Đang chuyển hướng...
                </motion.div>
              )}
              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold"
                >
                  <AlertCircle size={20} />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-orange-100/10 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

                {/* Existing images */}
                {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <ImageIcon size={16} className="text-[#F15B29]" />
                      Ảnh hiện tại
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((url) => (
                        <div key={url} className="relative group">
                          <img
                            src={url}
                            alt="existing"
                            className="w-28 h-28 object-cover rounded-2xl border border-gray-100 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleMarkRemove(url)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {newImagePreviews.map((src, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img
                            src={src}
                            alt={`new-${idx}`}
                            className="w-28 h-28 object-cover rounded-2xl border-2 border-[#F15B29]/40 shadow-sm"
                          />
                          <span className="absolute top-1 left-1 text-[10px] font-bold bg-[#F15B29] text-white px-1.5 py-0.5 rounded-full">
                            Mới
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(idx)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new images */}
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50/30 hover:border-[#F15B29]/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} className="text-gray-400 group-hover:text-[#F15B29] transition-colors" />
                    </div>
                    <p className="font-bold text-gray-500 text-sm">Thêm ảnh mới</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleNewImageChange}
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Type size={16} className="text-[#F15B29]" />
                    Tiêu đề <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-bold text-lg text-gray-900"
                    required
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <FileText size={16} className="text-[#F15B29]" />
                    Nội dung <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-700 resize-none"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Tag size={16} className="text-[#F15B29]" />
                    Tags <span className="text-xs font-normal text-gray-400">(tuỳ chọn)</span>
                  </label>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 text-[#F15B29] text-sm font-bold rounded-full"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Thêm tag... (Enter hoặc dấu phẩy)"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      className="px-4 py-3 bg-gray-100 hover:bg-orange-50 hover:text-[#F15B29] text-gray-500 rounded-2xl transition-colors disabled:opacity-40"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="px-6 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#F15B29] text-white font-extrabold rounded-xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
