import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Image as ImageIcon, LayoutGrid, Type, Send, EyeOff } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";

export function CreatePostView() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    void postService.getCreatePostCategories().then(setCategories);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    // In a real app, this would post to an API
    console.log("Posting:", { title, category, description, isAnonymous });

    // Navigate back to feed after "posting"
    navigate("/");
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-gray-900 font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      <div className="max-w-[800px] mx-auto w-full pt-6 px-4 md:px-8 lg:px-12 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors p-2 -ml-2 rounded-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold hidden sm:block">Quay lại</span>
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tạo bài viết mới</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </header>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-orange-100/10 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            {/* Image Upload Area (Mock) */}
            <div className="w-full h-64 sm:h-80 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon
                  size={32}
                  className="text-gray-400 group-hover:text-[#F15B29] transition-colors"
                />
              </div>
              <p className="font-bold text-gray-700">Kéo thả hình ảnh vào đây</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">hoặc nhấn để duyệt file</p>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Type size={16} className="text-[#F15B29]" />
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn cho tác phẩm của bạn..."
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-bold text-lg text-gray-900 placeholder:font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <LayoutGrid size={16} className="text-[#F15B29]" />
                  Chuyên ngành
                </label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        category === cat
                          ? "bg-[#F15B29] border-[#F15B29] text-white shadow-md shadow-orange-200"
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#F15B29] hover:text-[#F15B29]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Mô tả (Tuỳ chọn)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chia sẻ về quá trình thực hiện tác phẩm này..."
                  rows={4}
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-4 focus:ring-[#F15B29]/10 outline-none transition-all font-medium text-gray-700 resize-none"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm border ${isAnonymous ? "bg-orange-100 text-[#F15B29] border-orange-200" : "bg-white text-gray-400 border-gray-200"}`}
                  >
                    <EyeOff size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">Đăng ẩn danh</h4>
                    <p className="text-xs font-medium text-gray-500">
                      Người khác sẽ không thấy tên bạn trên bài viết này.
                    </p>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:ring-offset-2 shrink-0 ${
                    isAnonymous ? "bg-[#F15B29]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                      isAnonymous ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={!title || !category}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#F15B29] text-white font-extrabold rounded-xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                Đăng Bài
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
