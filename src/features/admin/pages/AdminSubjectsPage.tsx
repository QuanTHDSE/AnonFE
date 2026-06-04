import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { postService } from "@/services/postService";
import type { Subject } from "@/types";

const PAGE_SIZE = 8;

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function AdminSubjectsView() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [iconEmoji, setIconEmoji] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadSubjects = useCallback((q: string, p: number) => {
    setIsLoading(true);
    postService
      .getSubjects({ search: q || undefined, page: p, pageSize: PAGE_SIZE })
      .then(async (res) => {
        setTotal(res.total);
        setTotalPages(res.totalPages);
        const counts = await Promise.allSettled(
          res.subjects.map((s) => postService.getSubjectPostCount(s.id)),
        );
        setSubjects(
          res.subjects.map((s, i) => ({
            ...s,
            postCount: counts[i].status === "fulfilled" ? counts[i].value : 0,
          })),
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadSubjects(search, page);
  }, [page]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadSubjects(val, 1);
    }, 400);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) setSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugManual(true);
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setIconEmoji("");
    setSlugManual(false);
    setStatus("idle");
    setErrorMsg("");
    setEditingSubject(null);
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setSlug(subject.slug);
    setIconEmoji(subject.iconEmoji);
    setSlugManual(true);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await postService.deleteSubject(id);
      setConfirmDeleteId(null);
      loadSubjects(search, page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa môn học thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !iconEmoji.trim()) return;
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMsg("");
    try {
      const payload = { name: name.trim(), slug: slug.trim(), iconEmoji: iconEmoji.trim() };
      if (editingSubject) {
        await postService.updateSubject(editingSubject.id, payload);
      } else {
        await postService.createSubject(payload);
      }
      setStatus("success");
      loadSubjects(search, editingSubject ? page : 1);
      if (!editingSubject) setPage(1);
      setTimeout(resetForm, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : editingSubject
            ? "Cập nhật môn học thất bại."
            : "Tạo môn học thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = name.trim() && slug.trim() && iconEmoji.trim() && !isSubmitting;

  return (
    <div className="space-y-8 max-w-[1100px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý môn học</h1>
        <p className="text-gray-500 font-medium mt-1">
          Tạo môn học mới để người dùng sử dụng khi đăng bài.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Create Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              {editingSubject ? (
                <>
                  <Pencil size={20} className="text-[#F15B29]" />
                  Sửa: {editingSubject.name}
                </>
              ) : (
                <>
                  <Plus size={20} className="text-[#F15B29]" />
                  Tạo môn học mới
                </>
              )}
            </h2>
            {editingSubject && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 transition-colors"
              >
                <X size={14} />
                Hủy
              </button>
            )}
          </div>

          {/* Toast */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-bold"
              >
                <CheckCircle size={16} />
                {editingSubject ? "Cập nhật môn học thành công!" : "Tạo môn học thành công!"}
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold"
              >
                <AlertCircle size={16} />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Icon Emoji */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Smile size={15} className="text-[#F15B29]" />
                Icon Emoji <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border-2 border-orange-100 flex items-center justify-center text-3xl shrink-0 select-none">
                  {iconEmoji || "?"}
                </div>
                <input
                  type="text"
                  value={iconEmoji}
                  onChange={(e) => setIconEmoji(e.target.value)}
                  placeholder="Nhập emoji (vd: 📐 hoặc 🔬)"
                  maxLength={8}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-lg"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 font-medium pl-1">
                Copy emoji từ{" "}
                <a
                  href="https://emojipedia.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F15B29] hover:underline"
                >
                  emojipedia.org
                </a>{" "}
                và dán vào đây.
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <BookOpen size={15} className="text-[#F15B29]" />
                Tên môn học <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="vd: Toán học, Vật lý, Lập trình..."
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  Slug <span className="text-red-400">*</span>
                </span>
                {slugManual && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(toSlug(name));
                      setSlugManual(false);
                    }}
                    className="text-xs text-[#F15B29] hover:underline font-bold"
                  >
                    Tự động từ tên
                  </button>
                )}
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="vd: toan-hoc, vat-ly"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-400 font-medium pl-1">
                Slug tự động được tạo từ tên. Bạn có thể chỉnh thủ công.
              </p>
            </div>

            {/* Preview */}
            {(name || iconEmoji) && (
              <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Xem trước
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-[#F15B29] text-sm font-bold rounded-full">
                  {iconEmoji || "?"} {name || "Tên môn học"}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {editingSubject ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : editingSubject ? (
                <>
                  <CheckCircle size={18} />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Tạo môn học
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subject List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-[#F15B29]" />
              Danh sách môn học
            </h2>
            <span className="text-sm text-gray-400 font-medium">
              {isLoading ? "..." : `${total} môn học`}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm môn học..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-sm"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center gap-3 p-3 rounded-2xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <X size={32} className="text-gray-300" />
              <p className="font-medium text-sm">
                {search ? `Không tìm thấy "${search}".` : "Chưa có môn học nào."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors group ${
                    editingSubject?.id === subject.id
                      ? "bg-orange-50 border border-orange-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl shrink-0">
                    {subject.iconEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{subject.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{subject.slug}</p>
                    {subject.postCount !== undefined && (
                      <p className="text-xs text-gray-400 font-medium">
                        {subject.postCount} bài viết
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {confirmDeleteId === subject.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => void handleDelete(subject.id)}
                        disabled={deletingId === subject.id}
                        className="text-xs font-bold px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === subject.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Xác nhận"
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEditClick(subject)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-orange-100 text-gray-400 hover:text-[#F15B29] transition-colors"
                        title="Sửa"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(subject.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-gray-400 text-xs font-bold"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        disabled={isLoading}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                          page === item
                            ? "bg-[#F15B29] text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
