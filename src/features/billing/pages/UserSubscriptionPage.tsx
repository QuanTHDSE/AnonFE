import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Clock,
  Crown,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { subscriptionService, type UserSubscription } from "@/services/subscriptionService";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";

function StatusBadge({ status, expiresAt }: { status: number; expiresAt: string }) {
  const { label, color } = subscriptionService.subscriptionStatusLabel(status, expiresAt);
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
    red: "bg-red-100 text-red-600 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${styles[color] ?? styles.gray}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-gray-400"}`}
      />
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ActiveSubscriptionCard({ sub }: { sub: UserSubscription }) {
  const navigate = useNavigate();
  const days = subscriptionService.daysRemaining(sub.expiresAt);
  const totalDays =
    (new Date(sub.expiresAt).getTime() - new Date(sub.startedAt).getTime()) / 86_400_000;
  const progress = Math.max(0, Math.min(100, (days / totalDays) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#F15B29] to-[#e04a1a] rounded-3xl p-8 text-white shadow-xl shadow-orange-200/50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={16} className="text-yellow-300" />
              <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                Gói hiện tại
              </span>
            </div>
            <h2 className="text-2xl font-extrabold">{sub.planName ?? "Premium"}</h2>
          </div>
          <div className="bg-white/20 rounded-2xl p-3">
            <Sparkles size={24} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-orange-100 mb-2">
            <span>Còn {days} ngày</span>
            <span>Hết hạn {formatDate(sub.expiresAt)}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-orange-100">
            <span className="font-medium">Bắt đầu:</span> {formatDate(sub.startedAt)}
          </div>
          <button
            onClick={() => navigate("/premium")}
            className="flex items-center gap-2 bg-white text-[#F15B29] font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <RefreshCw size={14} />
            Gia hạn
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptySubscription() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center"
    >
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Crown size={28} className="text-[#F15B29]" />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">Chưa có gói Premium</h3>
      <p className="text-gray-500 font-medium mb-6">
        Nâng cấp để mở khóa tính năng đăng bài ẩn danh không giới hạn và nhiều hơn nữa.
      </p>
      <button
        onClick={() => navigate("/premium")}
        className="px-8 py-3 bg-[#F15B29] text-white font-bold rounded-2xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-200"
      >
        Xem các gói cước
      </button>
    </motion.div>
  );
}

function SubscriptionHistoryRow({ sub, idx }: { sub: UserSubscription; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
          <BadgeCheck size={18} className="text-[#F15B29]" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{sub.planName ?? "Premium"}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {formatDate(sub.startedAt)} → {formatDate(sub.expiresAt)}
          </p>
        </div>
      </div>
      <StatusBadge status={sub.status} expiresAt={sub.expiresAt} />
    </motion.div>
  );
}

export function UserSubscriptionView() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      navigate("/signin");
      return;
    }
    subscriptionService
      .getUserSubscriptions(user.id, 1, 50)
      .then((res) => setSubs(res.items ?? []))
      .catch(() => setError("Không thể tải thông tin gói cước."))
      .finally(() => setIsLoading(false));
  }, [isLoggedIn, user?.id]);

  const now = new Date();
  const activeSub = subs.find((s) => s.status === 0 && new Date(s.expiresAt) > now);
  const history = subs.filter((s) => s !== activeSub);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans">
      <AppSidebar activeItem="subscription" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-40 px-4 md:px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <Crown size={18} className="text-[#F15B29]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Gói cước của tôi</h1>
              <p className="text-gray-400 text-xs font-medium hidden md:block">
                Quản lý gói Premium và lịch sử đăng ký
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 md:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Đang tải...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500">
                <AlertCircle size={18} />
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* Active subscription */}
                <section>
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Gói hiện tại
                  </h2>
                  {activeSub ? <ActiveSubscriptionCard sub={activeSub} /> : <EmptySubscription />}
                </section>

                {/* Benefits when active */}
                {activeSub && (
                  <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-extrabold text-gray-900 mb-4">Quyền lợi của bạn</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Sparkles, label: "Đăng bài không giới hạn" },
                        { icon: BadgeCheck, label: "Bài viết được nổi bật" },
                        { icon: Crown, label: "Hỗ trợ ưu tiên 24/7" },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl"
                        >
                          <Icon size={18} className="text-[#F15B29] shrink-0" />
                          <span className="text-sm font-semibold text-gray-700">{label}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* History */}
                {history.length > 0 && (
                  <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays size={18} className="text-gray-400" />
                      <h2 className="font-extrabold text-gray-900">Lịch sử đăng ký</h2>
                    </div>
                    <div>
                      {history.map((sub, idx) => (
                        <SubscriptionHistoryRow key={sub.id} sub={sub} idx={idx} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Info row */}
                <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <Clock size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-blue-600 leading-relaxed">
                    Gói Premium tự động hết hạn sau thời gian đăng ký. Bạn có thể gia hạn bất cứ lúc
                    nào trước khi hết hạn.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
