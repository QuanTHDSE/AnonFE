import React, { useState } from "react";
import { Star, X, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/features/auth/AuthContext";
import { postService } from "@/services/postService";

interface PostRatingProps {
  postId: string;
  initialAverageRating?: number;
  initialRatingsCount?: number;
  initialMyStars?: number | null;
  size?: "sm" | "md";
  showCount?: boolean;
  onRatingChange?: (avg: number, count: number, myStars: number | null) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Tệ",
  2: "Kém",
  3: "Trung bình",
  4: "Tốt",
  5: "Xuất sắc",
};

export const PostRating: React.FC<PostRatingProps> = ({
  postId,
  initialAverageRating = 0,
  initialRatingsCount = 0,
  initialMyStars = null,
  size = "md",
  showCount = true,
  onRatingChange,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [avgRating, setAvgRating] = useState<number>(initialAverageRating);
  const [ratingsCount, setRatingsCount] = useState<number>(initialRatingsCount);
  const [myStars, setMyStars] = useState<number | null>(initialMyStars ?? null);

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const starSize = size === "sm" ? 16 : 20;

  const handleOpenPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate("/signin");
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleRate = async (stars: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (myStars === stars) {
        // Remove rating if clicking the same star
        const res = await postService.deletePostRating(postId);
        setAvgRating(res.averageRating);
        setRatingsCount(res.ratingsCount);
        setMyStars(null);
        setFeedbackMsg("Đã xóa đánh giá");
        onRatingChange?.(res.averageRating, res.ratingsCount, null);
      } else {
        // Submit or update rating
        const res = await postService.ratePost(postId, stars);
        setAvgRating(res.averageRating);
        setRatingsCount(res.ratingsCount);
        setMyStars(res.myStars);
        setFeedbackMsg(`Đã đánh giá ${stars}★`);
        onRatingChange?.(res.averageRating, res.ratingsCount, res.myStars);
      }
      setTimeout(() => {
        setFeedbackMsg(null);
        setIsOpen(false);
      }, 1200);
    } catch {
      setFeedbackMsg("Lỗi khi đánh giá");
      setTimeout(() => setFeedbackMsg(null), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAvg = avgRating > 0 ? avgRating.toFixed(1) : "0.0";

  return (
    <div className="relative inline-flex items-center">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenPicker}
        className={`flex items-center gap-1.5 rounded-full transition-all group ${
          myStars
            ? "text-amber-500 hover:text-amber-600"
            : "text-gray-500 hover:text-amber-500"
        }`}
        title={myStars ? `Đánh giá của bạn: ${myStars}★ (Bấm để thay đổi)` : "Đánh giá bài viết"}
      >
        <Star
          size={starSize}
          className={`transition-colors ${
            avgRating > 0 || myStars
              ? "fill-amber-400 text-amber-400"
              : "group-hover:text-amber-400 group-hover:fill-amber-400/20"
          }`}
        />
        <span className="text-sm font-semibold">
          {formattedAvg}
        </span>
        {showCount && (
          <span className="text-xs text-gray-400 font-medium">({ratingsCount})</span>
        )}
        {myStars && (
          <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
            {myStars}★
          </span>
        )}
      </button>

      {/* Rating Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100 min-w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">Đánh giá bài viết</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
              >
                <X size={14} />
              </button>
            </div>

            {feedbackMsg ? (
              <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-600">
                <Check size={16} />
                <span>{feedbackMsg}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoveredStar ?? myStars ?? 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={(e) => void handleRate(star, e)}
                        disabled={isSubmitting}
                        className="p-1 hover:scale-125 transition-transform disabled:opacity-50 focus:outline-none"
                        title={`${star} sao — ${RATING_LABELS[star]}`}
                      >
                        <Star
                          size={22}
                          className={`transition-colors ${
                            active
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-center mt-1 text-[11px] font-semibold text-gray-500">
                  {hoveredStar
                    ? `${hoveredStar}★ — ${RATING_LABELS[hoveredStar]}`
                    : myStars
                    ? `Đã chọn: ${myStars}★ (Nhấp lại để xoá)`
                    : "Chọn mức sao để đánh giá"}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
