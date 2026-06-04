import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Vector from "@/imports/Vector";
import { authService } from "@/services/authService";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

export function VerifyEmailView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setError("");
    setIsLoading(true);
    try {
      await authService.verifyEmail(email, otp);
      navigate("/signin", { state: { verified: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã xác minh không hợp lệ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMsg("");
    setError("");
    try {
      await authService
        .register({
          username: "",
          email,
          password: "",
          anonAlias: "",
        })
        .catch(() => {});
      setResendMsg("Đã gửi lại mã xác minh vào email của bạn.");
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
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Quay lại đăng ký</span>
        </button>

        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-xl shadow-orange-100/20">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 flex items-center justify-center">
              <Vector />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-[#F15B29]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Xác minh email</h1>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Chúng tôi đã gửi mã 6 chữ số đến
            </p>
            <p className="font-bold text-gray-900 mt-1 break-all">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
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

            <button
              type="submit"
              disabled={otp.length < 6 || isLoading}
              className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Đang xác minh..." : "Xác minh email"}
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
        </div>
      </motion.div>
    </div>
  );
}
