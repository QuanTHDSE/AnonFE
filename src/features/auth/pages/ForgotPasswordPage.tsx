import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import Vector from "@/imports/Vector";
import { authService } from "@/services/authService";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

type Step = "request" | "reset";

export function ForgotPasswordView() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = (location.state as { email?: string })?.email ?? "";

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState(prefillEmail);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi mã. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || newPassword.length < 6) return;
    setError("");
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      navigate("/signin", { state: { passwordReset: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMsg("");
    setError("");
    try {
      await authService.forgotPassword(email);
      setResendMsg("Đã gửi lại mã vào email của bạn.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi lại mã.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <button
          onClick={() => (step === "reset" ? setStep("request") : navigate("/signin"))}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">
            {step === "reset" ? "Đổi email" : "Quay lại đăng nhập"}
          </span>
        </button>

        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-xl shadow-orange-100/20">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 flex items-center justify-center">
              <Vector />
            </div>
          </div>

          {step === "request" ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-[#F15B29]" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Quên mật khẩu?</h1>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Nhập email của bạn, chúng tôi sẽ gửi mã đặt lại mật khẩu.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleRequest}>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ Email</label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã đặt lại"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-[#F15B29]" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                  Nhập mã 6 chữ số đã gửi đến
                </p>
                <p className="font-bold text-gray-900 mt-1 break-all">{email}</p>
              </div>

              <form className="space-y-6" onSubmit={handleReset}>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">
                    {error}
                  </div>
                )}
                {resendMsg && (
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center">
                    {resendMsg}
                  </div>
                )}

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-12 h-14 rounded-2xl border-gray-200 bg-gray-50 text-lg font-extrabold text-gray-900 data-[active=true]:border-[#F15B29] data-[active=true]:ring-[#F15B29]/20 data-[active=true]:bg-white"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otp.length < 6 || newPassword.length < 6 || isLoading}
                  className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm font-medium mb-3">Không nhận được mã?</p>
                <button
                  onClick={() => void handleResend()}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 text-[#F15B29] font-bold hover:underline disabled:opacity-50"
                >
                  <RefreshCw size={15} className={isResending ? "animate-spin" : ""} />
                  {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
                </button>
              </div>

              <p className="mt-6 text-center text-gray-400 text-xs font-medium">
                Kiểm tra hộp thư Spam nếu không thấy email.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
