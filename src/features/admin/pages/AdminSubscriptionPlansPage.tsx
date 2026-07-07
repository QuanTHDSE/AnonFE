import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle,
  Crown,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  subscriptionService,
  type SubscriptionPlan,
  type SubscriptionPlanPayload,
} from "@/services/subscriptionService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

const EMPTY_FORM: SubscriptionPlanPayload = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  durationDays: 30,
  maxPostsPerDay: 1,
  maxUploadsPerDay: 1,
  maxPostFileSizeMb: 10,
  maxPostImageCount: 1,
  maxPostMediaCount: 1,
  canAttachMediaToPost: true,
  canUploadPostFiles: false,
  canUseExclusiveAnonImages: false,
  canUsePremiumFeatures: false,
  isActive: true,
};

function slugify(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={min}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all font-semibold text-sm"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  accent = "orange",
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: "orange" | "amber";
}) {
  const on = accent === "amber" ? "bg-amber-500" : "bg-[#F15B29]";
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        {hint && <p className="text-xs font-medium text-gray-500 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
          checked ? on : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function AdminSubscriptionPlansView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SubscriptionPlanPayload>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const set = <K extends keyof SubscriptionPlanPayload>(
    key: K,
    value: SubscriptionPlanPayload[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = () => {
    setIsLoading(true);
    setLoadError("");
    subscriptionService
      .getAllPlans()
      .then(setPlans)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : "Không tải được danh sách gói."),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setSlugTouched(true);
    setForm({
      name: plan.name ?? "",
      slug: plan.slug ?? "",
      description: plan.description ?? "",
      price: plan.price ?? 0,
      durationDays: plan.durationDays ?? 30,
      maxPostsPerDay: plan.maxPostsPerDay ?? 1,
      maxUploadsPerDay: plan.maxUploadsPerDay ?? 1,
      maxPostFileSizeMb: plan.maxPostFileSizeMb ?? 10,
      maxPostImageCount: plan.maxPostImageCount ?? 1,
      maxPostMediaCount: plan.maxPostMediaCount ?? 1,
      canAttachMediaToPost: plan.canAttachMediaToPost ?? true,
      canUploadPostFiles: plan.canUploadPostFiles ?? false,
      canUseExclusiveAnonImages: plan.canUseExclusiveAnonImages ?? false,
      canUsePremiumFeatures: plan.canUsePremiumFeatures ?? false,
      isActive: plan.isActive ?? true,
    });
    setStatus("idle");
    setErrorMsg("");
  };

  const handleNameChange = (value: string) => {
    set("name", value);
    if (!slugTouched) set("slug", slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setStatus("error");
      setErrorMsg("Tên và slug là bắt buộc.");
      return;
    }
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMsg("");
    try {
      const payload: SubscriptionPlanPayload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
      };
      if (editingId) await subscriptionService.updatePlan(editingId, payload);
      else await subscriptionService.createPlan(payload);
      setStatus("success");
      load();
      setTimeout(resetForm, 1400);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : editingId
            ? "Cập nhật gói thất bại."
            : "Tạo gói thất bại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await subscriptionService.deletePlan(deleteTarget.id);
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      load();
    } catch {
      // keep dialog open on error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1150px]">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Quản lý gói cước</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tạo và cấu hình các gói Subscription cùng giới hạn tính năng cho người dùng.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              {editingId ? (
                <>
                  <Pencil size={18} className="text-[#F15B29]" />
                  Sửa gói
                </>
              ) : (
                <>
                  <Plus size={18} className="text-[#F15B29]" />
                  Tạo gói mới
                </>
              )}
            </h2>
            {editingId && (
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
                {editingId ? "Cập nhật gói thành công!" : "Tạo gói thành công!"}
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
            {/* Name + slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">
                  Tên gói <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="vd: Premium tháng"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all font-semibold text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  placeholder="premium-thang"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600">Mô tả</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="Mô tả ngắn về quyền lợi của gói..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-sm resize-none"
              />
            </div>

            {/* Price + duration */}
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Giá"
                value={form.price}
                onChange={(v) => set("price", v)}
                suffix="đ"
              />
              <NumberField
                label="Thời hạn"
                value={form.durationDays}
                onChange={(v) => set("durationDays", v)}
                suffix="ngày"
                min={1}
              />
            </div>

            {/* Limits */}
            <div className="pt-1">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                Giới hạn
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumberField
                  label="Bài / ngày"
                  value={form.maxPostsPerDay}
                  onChange={(v) => set("maxPostsPerDay", v)}
                />
                <NumberField
                  label="Upload / ngày"
                  value={form.maxUploadsPerDay}
                  onChange={(v) => set("maxUploadsPerDay", v)}
                />
                <NumberField
                  label="Cỡ file"
                  value={form.maxPostFileSizeMb}
                  onChange={(v) => set("maxPostFileSizeMb", v)}
                  suffix="MB"
                />
                <NumberField
                  label="Số ảnh / bài"
                  value={form.maxPostImageCount}
                  onChange={(v) => set("maxPostImageCount", v)}
                />
                <NumberField
                  label="Media / bài"
                  value={form.maxPostMediaCount}
                  onChange={(v) => set("maxPostMediaCount", v)}
                />
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-2.5">
              <Toggle
                label="Cho đính kèm media vào bài"
                checked={form.canAttachMediaToPost}
                onChange={(v) => set("canAttachMediaToPost", v)}
              />
              <Toggle
                label="Cho upload tệp đính kèm"
                checked={form.canUploadPostFiles}
                onChange={(v) => set("canUploadPostFiles", v)}
              />
              <Toggle
                label="Dùng ảnh ẩn danh độc quyền"
                hint="Mở khoá thư viện ảnh ẩn danh Premium"
                checked={form.canUseExclusiveAnonImages}
                onChange={(v) => set("canUseExclusiveAnonImages", v)}
                accent="amber"
              />
              <Toggle
                label="Bật tính năng Premium"
                hint="Huy hiệu, quyền lợi nâng cao..."
                checked={form.canUsePremiumFeatures}
                onChange={(v) => set("canUsePremiumFeatures", v)}
                accent="amber"
              />
              <Toggle
                label="Đang hoạt động"
                hint="Chỉ gói hoạt động mới hiện cho người dùng mua."
                checked={form.isActive}
                onChange={(v) => set("isActive", v)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {editingId ? "Đang lưu..." : "Đang tạo..."}
                </>
              ) : editingId ? (
                <>
                  <CheckCircle size={18} />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Tạo gói
                </>
              )}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Crown size={18} className="text-[#F15B29]" />
              Danh sách gói
            </h2>
            <span className="text-sm text-gray-400 font-medium">
              {isLoading ? "..." : `${plans.length} gói`}
            </span>
          </div>

          {loadError ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {loadError}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <Crown size={32} className="text-gray-300" />
              <p className="font-medium text-sm">Chưa có gói nào. Tạo gói đầu tiên bên trái.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border-2 p-4 transition-colors ${
                    editingId === plan.id ? "border-[#F15B29]" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-gray-900">{plan.name}</h3>
                        {!plan.isActive && (
                          <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                            Tắt
                          </span>
                        )}
                        {plan.canUsePremiumFeatures && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                            <Crown size={9} />
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                        <Tag size={10} />
                        {plan.slug}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[#F15B29]">
                        {subscriptionService.formatPrice(plan.price)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{plan.durationDays} ngày</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Chip>{plan.maxPostsPerDay ?? 0} bài/ngày</Chip>
                    <Chip>{plan.maxPostImageCount ?? 0} ảnh/bài</Chip>
                    {plan.canUploadPostFiles && <Chip>Đính kèm tệp</Chip>}
                    {plan.canUseExclusiveAnonImages && <Chip>Ảnh độc quyền</Chip>}
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-3">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#F15B29] hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Pencil size={13} />
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeleteTarget(plan)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                      Xóa
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa gói cước</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa gói{" "}
              <span className="font-bold text-gray-900">{deleteTarget?.name}</span>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
      {children}
    </span>
  );
}
