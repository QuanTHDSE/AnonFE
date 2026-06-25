import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Image as ImageIcon,
  Type,
  Send,
  EyeOff,
  X,
  Plus,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";
import type { Subject } from "@/types";

export function CreatePostView() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void postService.getSubjects({ pageSize: 100 }).then((res) => setSubjects(res.subjects));
  }, []);

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

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setImageFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setAttachFiles((prev) => [...prev, ...files]);
    if (attachInputRef.current) attachInputRef.current.value = "";
  };

  const handleRemoveAttach = (index: number) => {
    setAttachFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      title.trim().length < 5 ||
      !content.trim() ||
      content.trim().length < 10 ||
      !subjectId
    )
      return;

    setIsLoading(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await postService.createPost({
        title,
        content,
        subjectId,
        tags: tags.length > 0 ? tags : undefined,
        isAnonymous,
        images: imageFiles.length > 0 ? imageFiles : undefined,
        files: attachFiles.length > 0 ? attachFiles : undefined,
      });
      setSubmitStatus("success");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  const canSubmit =
    title.trim().length >= 5 && content.trim().length >= 10 && subjectId && !isLoading;

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
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tạo bài viết mới</h1>
          <div className="w-24" />
        </header>

        {/* Toast notifications */}
        <AnimatePresence>
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold"
            >
              <CheckCircle size={20} />
              Đăng bài thành công! Đang chuyển hướng...
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

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-orange-100/10 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            {/* Image Upload Area */}
            <div className="space-y-3">
              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        className="w-28 h-28 object-cover rounded-2xl border border-gray-100 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-orange-50/30 hover:border-[#F15B29]/40 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon
                    size={24}
                    className="text-gray-400 group-hover:text-[#F15B29] transition-colors"
                  />
                </div>
                <p className="font-bold text-gray-600 text-sm">Nhấn để thêm hình ảnh</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Nhiều ảnh</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* File attachments */}
            <div className="space-y-3">
              {attachFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  {attachFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <FileText size={18} className="text-gray-400 shrink-0" />
                      <span className="flex-1 text-sm font-semibold text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttach(idx)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => attachInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#F15B29] transition-colors"
              >
                <Plus size={16} />
                Thêm tệp đính kèm
              </button>
              <input
                ref={attachInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachChange}
              />
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Type size={16} className="text-[#F15B29]" />
                  Tiêu đề bài viết <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn cho tác phẩm của bạn..."
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-bold text-lg text-gray-900 placeholder:font-medium"
                  required
                />
                <p
                  className={`text-xs ml-1 font-medium ${title.trim().length > 0 && title.trim().length < 5 ? "text-red-400" : "text-gray-400"}`}
                >
                  {title.trim().length}/255 ký tự (tối thiểu 5)
                </p>
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
                  placeholder="Chia sẻ về tác phẩm, quá trình thực hiện, hay suy nghĩ của bạn..."
                  rows={5}
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-700 resize-none"
                  required
                />
                <p
                  className={`text-xs ml-1 font-medium ${content.trim().length > 0 && content.trim().length < 10 ? "text-red-400" : "text-gray-400"}`}
                >
                  {content.trim().length} ký tự (tối thiểu 10)
                </p>
              </div>

              {/* Subject / Chuyên ngành */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  Chuyên ngành <span className="text-red-400">*</span>
                </label>
                {subjects.length === 0 ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {subjects.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSubjectId(sub.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          subjectId === sub.id
                            ? "bg-[#F15B29] border-[#F15B29] text-white shadow-md shadow-orange-200"
                            : "bg-white border-gray-200 text-gray-600 hover:border-[#F15B29] hover:text-[#F15B29]"
                        }`}
                      >
                        <span>{sub.iconEmoji}</span>
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
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
                          onClick={() => handleRemoveTag(tag)}
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

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm border ${
                      isAnonymous
                        ? "bg-orange-100 text-[#F15B29] border-orange-200"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    <EyeOff size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Đăng ẩn danh</h4>
                    <p className="text-xs font-medium text-gray-500">
                      Người khác sẽ không thấy tên bạn trên bài viết này.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:ring-offset-2 shrink-0 ${
                    isAnonymous ? "bg-[#F15B29]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                      isAnonymous ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
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
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Đăng Bài
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
