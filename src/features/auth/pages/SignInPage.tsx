import React, { useState } from "react";
import { motion } from "motion/react";
import Vector from "@/imports/Vector";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/apiClient";
import { useAuth } from "@/features/auth/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getLoginErrorMessage(error: unknown): string {
  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    const errorBody = error as { message?: unknown; error?: unknown };
    if (typeof errorBody.message === "string") {
      message = errorBody.message;
    } else if (typeof errorBody.error === "string") {
      message = errorBody.error;
    } else if (errorBody.error && typeof errorBody.error === "object") {
      const nestedMessage = (errorBody.error as { message?: unknown }).message;
      if (typeof nestedMessage === "string") message = nestedMessage;
    }
  }

  const normalizedMessage = message.trim().toLowerCase();

  if (
    !normalizedMessage ||
    normalizedMessage === "[object object]" ||
    normalizedMessage.includes("invalid email or password") ||
    normalizedMessage.includes("incorrect email or password") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage === "http 401"
  ) {
    return "Email hoặc mật khẩu không chính xác.";
  }

  if (normalizedMessage.includes("not verified") || normalizedMessage.includes("verify email")) {
    return "Email chưa được xác minh. Vui lòng kiểm tra hộp thư của bạn.";
  }

  if (normalizedMessage.includes("locked") || normalizedMessage.includes("disabled")) {
    return "Tài khoản đang bị khóa hoặc đã bị vô hiệu hóa.";
  }

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("networkerror") ||
    normalizedMessage.includes("load failed")
  ) {
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
  }

  return message;
}

export function SignInView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
  const justRegistered = (location.state as { registered?: boolean })?.registered;
  const justVerified = (location.state as { verified?: boolean })?.verified;
  const justResetPassword = (location.state as { passwordReset?: boolean })?.passwordReset;

  const [googleError, setGoogleError] = useState("");

  const handleGoogleSuccess = async (credential: string) => {
    setGoogleError("");
    setIsGoogleLoading(true);
    try {
      await authService.loginWithGoogle(
        credential,
        `ghost_${Math.random().toString(36).slice(2, 6)}`,
      );
      refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      setGoogleError(getErrorMessage(err, "Đăng nhập Google thất bại."));
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Địa chỉ email không đúng định dạng.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: normalizedEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Quay lại trang chủ</span>
        </button>

        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-xl shadow-orange-100/20">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 flex items-center justify-center">
              <Vector />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-gray-500 font-medium">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin} noValidate>
            {justResetPassword && !error && (
              <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center">
                Đặt lại mật khẩu thành công! Hãy đăng nhập.
              </div>
            )}

            {justVerified && !error && !justResetPassword && (
              <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center">
                Email đã được xác minh! Hãy đăng nhập.
              </div>
            )}

            {justRegistered && !error && !justVerified && (
              <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold text-center">
                Tạo tài khoản thành công! Hãy đăng nhập.
              </div>
            )}

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password", { state: { email } })}
                  className="text-sm font-bold text-[#F15B29] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F15B29] transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium disabled:opacity-50"
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
              disabled={isLoading || isGoogleLoading}
              className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-gray-400 font-bold tracking-wider">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col items-center gap-3">
            {googleError && (
              <p className="text-red-500 text-sm font-bold text-center">{googleError}</p>
            )}
            {isGoogleLoading ? (
              <div className="flex items-center justify-center gap-3 py-3.5 px-6 bg-orange-50 border border-orange-200 text-[#F15B29] font-bold rounded-2xl w-full max-w-[368px]">
                <Loader2 size={20} className="animate-spin" />
                <span>Đang đăng nhập bằng Google...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(res) => {
                  if (res.credential) void handleGoogleSuccess(res.credential);
                }}
                onError={() => setGoogleError("Đăng nhập Google thất bại.")}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="368"
              />
            )}
          </div>

          <p className="mt-10 text-center text-gray-500 font-medium">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#F15B29] font-bold hover:underline"
            >
              Tạo ngay
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
