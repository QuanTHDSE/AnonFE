import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Vector from "@/imports/Vector";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Wallet, Building2, ShieldCheck, Check, Lock } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

export function CheckoutView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "momo" | "bank">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Lấy thông tin gói từ state (được truyền từ trang Premium)
  const planData = location.state || {
    tier: "Premium",
    cycle: "monthly",
    price: "150.000",
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Giả lập xử lý thanh toán
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (!isLoggedIn) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-10 max-w-md w-full text-center border border-gray-100 shadow-xl shadow-green-100/20"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-500" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Thanh toán thành công!</h2>
          <p className="text-gray-500 mb-8 font-medium">
            Cảm ơn bạn đã nâng cấp gói {planData.tier}. Các tính năng đặc quyền đã được kích hoạt.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200"
          >
            Quay lại Trang Chủ
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/premium")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors group p-2 -ml-2 rounded-xl"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold hidden sm:block">Quay lại Gói cước</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Vector />
            </div>
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">Figma Make</span>
          </div>

          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Bảo mật</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Payment Form */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
              Chọn phương thức thanh toán
            </h1>

            <form onSubmit={handlePayment} className="space-y-8">
              {/* Payment Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === "card" ? "border-[#F15B29] bg-orange-50/50 shadow-md shadow-orange-100/50" : "border-gray-100 bg-white hover:border-gray-200"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === "card" ? "bg-[#F15B29] text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    <CreditCard size={24} />
                  </div>
                  <span
                    className={`font-bold ${paymentMethod === "card" ? "text-[#F15B29]" : "text-gray-700"}`}
                  >
                    Thẻ tín dụng
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("momo")}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === "momo" ? "border-[#F15B29] bg-orange-50/50 shadow-md shadow-orange-100/50" : "border-gray-100 bg-white hover:border-gray-200"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === "momo" ? "bg-[#F15B29] text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Wallet size={24} />
                  </div>
                  <span
                    className={`font-bold ${paymentMethod === "momo" ? "text-[#F15B29]" : "text-gray-700"}`}
                  >
                    Ví MoMo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === "bank" ? "border-[#F15B29] bg-orange-50/50 shadow-md shadow-orange-100/50" : "border-gray-100 bg-white hover:border-gray-200"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === "bank" ? "bg-[#F15B29] text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Building2 size={24} />
                  </div>
                  <span
                    className={`font-bold ${paymentMethod === "bank" ? "text-[#F15B29]" : "text-gray-700"}`}
                  >
                    Chuyển khoản
                  </span>
                </button>
              </div>

              {/* Form Fields - Conditionally rendered based on method */}
              <AnimatePresence mode="wait">
                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Tên trên thẻ</label>
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        required
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-bold text-gray-900 uppercase"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Số thẻ</label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          required
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-900 tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Ngày hết hạn</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-900 text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          required
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-900 text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "momo" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-8 rounded-3xl border border-[#a50064]/20 shadow-sm flex flex-col items-center justify-center text-center overflow-hidden"
                  >
                    <div className="w-16 h-16 bg-[#a50064] rounded-2xl flex items-center justify-center mb-4">
                      <span className="text-white font-black text-xl">MoMo</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Thanh toán qua Ví MoMo</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">
                      Hệ thống sẽ chuyển hướng bạn đến ứng dụng MoMo để hoàn tất thanh toán.
                    </p>
                  </motion.div>
                )}

                {paymentMethod === "bank" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center overflow-hidden"
                  >
                    <Building2 size={48} className="text-blue-500 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">Chuyển khoản ngân hàng</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">
                      Bạn sẽ nhận được thông tin số tài khoản và nội dung chuyển khoản ở bước tiếp
                      theo.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-[#F15B29] text-white font-extrabold text-lg rounded-2xl hover:bg-[#d94a1d] transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Lock size={20} />
                    Thanh toán {planData.price}đ
                  </>
                )}
              </button>
              <p className="text-center text-xs font-bold text-gray-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={14} />
                Giao dịch của bạn được mã hóa và bảo mật an toàn 256-bit.
              </p>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[400px] order-1 lg:order-2">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 sticky top-28">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">Gói {planData.tier}</p>
                  <p className="text-sm font-medium text-gray-500 bg-gray-100 inline-flex px-2 py-0.5 rounded-lg">
                    Thanh toán {planData.cycle === "yearly" ? "hàng năm" : "hàng tháng"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900 text-lg">{planData.price}đ</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-gray-500 font-medium text-sm">
                  <span>Tạm tính</span>
                  <span>{planData.price}đ</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 font-medium text-sm">
                  <span>Thuế (VAT 10%)</span>
                  <span>Đã bao gồm</span>
                </div>
                {planData.cycle === "yearly" && (
                  <div className="flex items-center justify-between text-green-600 font-bold text-sm">
                    <span>Khuyến mãi hàng năm</span>
                    <span>-16%</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between mb-8">
                <span className="font-extrabold text-gray-900">Tổng cộng</span>
                <span className="font-extrabold text-2xl text-[#F15B29]">{planData.price}đ</span>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 flex gap-3">
                <div className="mt-0.5">
                  <Check size={18} className="text-[#F15B29]" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Đảm bảo hoàn tiền trong 7 ngày
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    Hoàn tiền 100% nếu bạn không hài lòng với trải nghiệm Premium.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
