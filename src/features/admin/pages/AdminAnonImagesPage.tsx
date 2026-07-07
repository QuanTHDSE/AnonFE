import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle,
  Crown,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { anonImageService, type AnonImage } from "@/services/anonImageService";

export function AdminAnonImagesView() {
  const [images, setImages] = useState<AnonImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // form state
  const [editing, setEditing] = useState<AnonImage | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = () => {
    setIsLoading(true);
    setLoadError("");
    anonImageService
      .getAnonImages(false)
      .then(setImages)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : "Không tải được thư viện ảnh."),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setIsActive(true);
    setIsExclusive(false);
    setImageFile(null);
    setImagePreview("");
    setStatus("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (img: AnonImage) => {
    setEditing(img);
    setName(img.name);
    setIsActive(img.isActive);
    setIsExclusive(img.isExclusive);
    setImageFile(null);
    setImagePreview(img.imageUrl);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // New images require a file; edits can keep the existing one.
    if (!editing && !imageFile) {
      setStatus("error");
      setErrorMsg("Vui lòng chọn ảnh.");
      return;
    }
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMsg("");
    try {
      const payload = { name: name.trim(), image: imageFile, isActive, isExclusive };
      if (editing) {
        await anonImageService.updateAnonImage(editing.id, payload);
      } else {
        await anonImageService.createAnonImage(payload);
      }
      setStatus("success");
      load();
      setTimeout(resetForm, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : editing
            ? "Cập nhật ảnh thất bại."
            : "Tạo ảnh thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, permanent: boolean) => {
    setDeletingId(id);
    try {
      if (permanent) await anonImageService.permanentDeleteAnonImage(id);
      else await anonImageService.deleteAnonImage(id);
      setConfirmDeleteId(null);
      if (editing?.id === id) resetForm();
      setActionError("");
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Xóa ảnh thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  const canSubmit = name.trim() && (editing || imageFile) && !isSubmitting;

  return (
    <div className="space-y-8 max-w-[1100px]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Quản lý ảnh ẩn danh
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Thư viện ảnh đại diện để người dùng chọn khi đăng bài ẩn danh.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              {editing ? (
                <>
                  <Pencil size={20} className="text-[#F15B29]" />
                  Sửa: {editing.name}
                </>
              ) : (
                <>
                  <Plus size={20} className="text-[#F15B29]" />
                  Thêm ảnh mới
                </>
              )}
            </h2>
            {editing && (
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

          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-bold"
              >
                <CheckCircle size={16} />
                {editing ? "Cập nhật ảnh thành công!" : "Thêm ảnh thành công!"}
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
            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImagePlus size={15} className="text-[#F15B29]" />
                Ảnh {!editing && <span className="text-red-400">*</span>}
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={24} className="text-gray-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-orange-50 hover:text-[#F15B29] text-gray-600 rounded-2xl transition-colors font-bold text-sm"
                >
                  <Upload size={16} />
                  {editing ? "Đổi ảnh" : "Chọn ảnh"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="vd: Mèo cam, Ninja..."
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* IsActive */}
            <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Đang hoạt động</p>
                <p className="text-xs font-medium text-gray-500">
                  Chỉ ảnh hoạt động mới hiện cho người dùng chọn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                  isActive ? "bg-[#F15B29]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* IsExclusive */}
            <div className="flex items-center justify-between p-4 bg-amber-50/80 rounded-2xl border border-amber-100">
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Crown size={15} className="text-amber-500" />
                  Độc quyền (Premium)
                </p>
                <p className="text-xs font-medium text-gray-500">
                  Chỉ người dùng có gói Premium mới chọn được ảnh này.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExclusive((v) => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                  isExclusive ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                    isExclusive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {editing ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : editing ? (
                <>
                  <CheckCircle size={18} />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Thêm ảnh
                </>
              )}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <ImagePlus size={20} className="text-[#F15B29]" />
              Thư viện ảnh
            </h2>
            <span className="text-sm text-gray-400 font-medium">
              {isLoading ? "..." : `${images.length} ảnh`}
            </span>
          </div>

          {actionError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {actionError}
            </div>
          )}

          {loadError ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {loadError}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse aspect-square rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <ImagePlus size={32} className="text-gray-300" />
              <p className="font-medium text-sm">Chưa có ảnh nào trong thư viện.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative group rounded-2xl overflow-hidden border-2 ${
                    editing?.id === img.id ? "border-[#F15B29]" : "border-gray-100"
                  }`}
                >
                  <div className="aspect-square bg-gray-50">
                    <img src={img.imageUrl} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    {!img.isActive && (
                      <span className="text-[10px] font-bold bg-gray-900/70 text-white px-1.5 py-0.5 rounded-full">
                        Tắt
                      </span>
                    )}
                    {img.isExclusive && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                        <Crown size={9} />
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[11px] font-bold text-white truncate">{img.name}</p>
                  </div>

                  {confirmDeleteId === img.id ? (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 p-2">
                      <button
                        onClick={() => void handleDelete(img.id, false)}
                        disabled={deletingId === img.id}
                        className="w-full text-[11px] font-bold px-2 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        {deletingId === img.id ? "..." : "Xóa mềm"}
                      </button>
                      <button
                        onClick={() => void handleDelete(img.id, true)}
                        disabled={deletingId === img.id}
                        className="w-full text-[11px] font-bold px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Xóa vĩnh viễn
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="w-full text-[11px] font-bold px-2 py-1 bg-white/90 text-gray-700 rounded-lg hover:bg-white"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(img)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-gray-600 hover:text-[#F15B29] transition-colors"
                        title="Sửa"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(img.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-gray-600 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
