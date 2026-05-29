import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import { billingService } from "@/services/billingService";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import type { BillingCycle, PremiumPlan } from "@/types";

export function PremiumView() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [tiers, setTiers] = useState<PremiumPlan[]>([]);

  useEffect(() => {
    void billingService.getPremiumPlans().then(setTiers);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <AppSidebar activeItem="premium" />
      {/* Main Content */}
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-full border border-gray-200">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 border-2 border-white flex items-center justify-center">
                    <span className="font-bold text-[#F15B29] text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() ?? "AN"}
                    </span>
                  </div>
                  <span className="font-medium text-sm hidden sm:block">
                    {user?.name ?? "User"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2.5 text-sm font-bold text-[#F15B29] hover:bg-orange-50 rounded-xl transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Pricing Content */}
        <main className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Chọn gói phù hợp với bạn</h2>
              <p className="text-gray-500 text-lg mb-8">
                Trải nghiệm nền tảng theo cách riêng của bạn. Hủy bất cứ lúc nào.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="inline-flex bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Hàng tháng
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Hàng năm
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    Tiết kiệm 16%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={`relative bg-white rounded-3xl p-8 border ${tier.popular ? "border-[#F15B29] shadow-xl shadow-orange-100" : "border-gray-200"} flex flex-col`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F15B29] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                      PHỔ BIẾN NHẤT
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 h-10">{tier.description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold">{tier.price[billingCycle]}đ</span>
                    {tier.price[billingCycle] !== "0" && (
                      <span className="text-gray-500 font-medium">
                        /{billingCycle === "monthly" ? "tháng" : "năm"}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate("/signin");
                      } else if (tier.name !== "Cơ bản") {
                        navigate("/checkout", {
                          state: {
                            tier: tier.name,
                            cycle: billingCycle,
                            price: tier.price[billingCycle],
                          },
                        });
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold mb-8 transition-transform active:scale-95 ${tier.buttonStyle}`}
                  >
                    {tier.buttonText}
                  </button>

                  <div className="space-y-4 mt-auto">
                    <p className="text-sm font-bold text-gray-900 mb-4">Bao gồm:</p>
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check size={20} className="text-[#F15B29] shrink-0" strokeWidth={3} />
                        ) : (
                          <X size={20} className="text-gray-300 shrink-0" strokeWidth={3} />
                        )}
                        <span
                          className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
