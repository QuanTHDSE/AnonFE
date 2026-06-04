import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Clock, Loader2, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { subscriptionService, type SubscriptionPlan } from "@/services/subscriptionService";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";

const PLAN_ICONS = [Sparkles, Zap, Check];
const PLAN_COLORS = [
  { border: "border-gray-200", badge: "", button: "bg-[#F15B29] hover:bg-[#d94a1d] text-white shadow-md shadow-orange-200" },
  { border: "border-[#F15B29]", badge: "PHỔ BIẾN", button: "bg-[#F15B29] hover:bg-[#d94a1d] text-white shadow-xl shadow-orange-200" },
  { border: "border-gray-900", badge: "CAO CẤP NHẤT", button: "bg-gray-900 hover:bg-gray-800 text-white shadow-md shadow-gray-300" },
];

function formatDuration(days: number): string {
  if (days >= 365) return `${Math.round(days / 365)} năm`;
  if (days >= 30) return `${Math.round(days / 30)} tháng`;
  return `${days} ngày`;
}

export function PremiumView() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    subscriptionService
      .getPlans()
      .then(setPlans)
      .catch(() => setError("Không thể tải gói cước. Vui lòng thử lại."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    navigate("/checkout", {
      state: { planId: plan.id, planName: plan.name, price: plan.price, durationDays: plan.durationDays },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="premium" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-40 px-4 md:px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Gói cước Premium</h1>
              <p className="text-gray-500 text-sm hidden md:block mt-1">
                Nâng cấp tài khoản để mở khóa các tính năng đặc quyền
              </p>
            </div>
            {isLoggedIn ? (
              <div className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-full border border-gray-200">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 border-2 border-white flex items-center justify-center">
                  <span className="font-bold text-[#F15B29] text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() ?? "AN"}
                  </span>
                </div>
                <span className="font-medium text-sm hidden sm:block">{user?.name ?? "User"}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2.5 text-sm font-bold text-[#F15B29] hover:bg-orange-50 rounded-xl transition-colors"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-extrabold mb-4"
              >
                Chọn gói phù hợp với bạn
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-gray-500 text-lg"
              >
                Trải nghiệm nền tảng theo cách riêng của bạn. Hủy bất cứ lúc nào.
              </motion.p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="font-medium">Đang tải gói cước...</span>
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <div className="text-center py-16 text-red-500 font-medium">{error}</div>
            )}

            {/* Plan Cards */}
            {!isLoading && !error && plans.length > 0 && (
              <div
                className={`grid gap-8 max-w-5xl mx-auto ${
                  plans.length === 1
                    ? "grid-cols-1 max-w-sm"
                    : plans.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-3"
                }`}
              >
                {plans.map((plan, idx) => {
                  const color = PLAN_COLORS[idx % PLAN_COLORS.length];
                  const Icon = PLAN_ICONS[idx % PLAN_ICONS.length];
                  const features = subscriptionService.parseFeatures(plan.features);
                  const isPopular = idx === 1 && plans.length >= 2;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative bg-white rounded-3xl p-8 border-2 ${color.border} flex flex-col ${isPopular ? "shadow-xl shadow-orange-100" : "shadow-sm"}`}
                    >
                      {color.badge && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F15B29] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                          {color.badge}
                        </div>
                      )}

                      {/* Plan header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                          <Icon size={20} className="text-[#F15B29]" />
                        </div>
                        <h3 className="text-xl font-extrabold">{plan.name}</h3>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium mb-6">
                        <Clock size={14} />
                        <span>Hiệu lực {formatDuration(plan.durationDays)}</span>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {subscriptionService.formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-500 font-medium text-sm ml-1">
                          / {formatDuration(plan.durationDays)}
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3.5 rounded-xl font-bold mb-8 transition-all active:scale-95 ${color.button}`}
                      >
                        Mua {plan.name}
                      </button>

                      {/* Features */}
                      {features.length > 0 && (
                        <div className="space-y-3 mt-auto">
                          <p className="text-sm font-bold text-gray-900 mb-2">Bao gồm:</p>
                          {features.map((f, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2.5">
                              <Check size={16} className="text-[#F15B29] shrink-0 mt-0.5" strokeWidth={3} />
                              <span className="text-sm text-gray-600">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && plans.length === 0 && (
              <div className="text-center py-16 text-gray-400 font-medium">
                Chưa có gói cước nào.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
