import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/AuthContext";
import Vector from "@/imports/Vector";

const WELCOME_STORAGE_KEY = "anon_first_visit_welcome_seen";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const hasSeen = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (!hasSeen) {
      // Delay slightly for smooth entrance after page load
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleExplore = () => {
    handleClose();
    navigate("/");
  };

  const handleSignIn = () => {
    handleClose();
    navigate(isLoggedIn ? "/profile" : "/signin");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-[36px] shadow-2xl border border-gray-100 overflow-hidden z-10 my-auto"
          >
            {/* Top Decorative Header */}
            <div className="relative bg-gradient-to-br from-[#F15B29] via-[#ff6f3d] to-[#ff8c00] p-8 text-white overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -top-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white/90 hover:text-white transition-colors"
                title="Đóng"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <div className="w-7 h-7">
                    <Vector />
                  </div>
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider border border-white/30 flex items-center gap-1">
                  <Sparkles size={12} className="text-yellow-300 fill-yellow-300" />
                  Chào mừng bạn
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Chào mừng đến với Anonwork! 🚀
              </h2>
              <p className="text-white/90 text-sm sm:text-base font-medium mt-2 leading-relaxed">
                Nền tảng chia sẻ, hỏi đáp và thảo luận ẩn danh dành cho cộng đồng sinh viên & giới trẻ.
              </p>
            </div>

            {/* Features List */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-orange-50/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-orange-100 text-[#F15B29] flex-shrink-0 mt-0.5">
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Chia sẻ Ẩn danh An toàn</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Tự do đặt câu hỏi, chia sẻ trải nghiệm và bày tỏ quan điểm cá nhân mà không ngại lộ danh tính.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-orange-50/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 flex-shrink-0 mt-0.5">
                  <MessageSquare size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Thảo luận & Đánh giá bài viết</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Tương tác chất lượng với hệ thống upvote, bình luận và xếp hạng bài viết theo cộng đồng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-orange-50/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0 mt-0.5">
                  <Crown size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Bảng Xếp Hạng & Quyền lợi Premium</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Tích lũy điểm đóng góp hàng tháng, vinh danh Top Contributors và mở khóa tính năng đặc quyền.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <button
                type="button"
                onClick={handleExplore}
                className="w-full sm:flex-1 py-3.5 px-6 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 flex items-center justify-center gap-2 text-sm"
              >
                Khám phá ngay
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleSignIn}
                className="w-full sm:w-auto py-3.5 px-6 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
              >
                {isLoggedIn ? "Trang cá nhân" : "Đăng nhập / Đăng ký"}
              </button>
            </div>

            <div className="pb-6 text-center">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Bỏ qua và không hiển thị lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
