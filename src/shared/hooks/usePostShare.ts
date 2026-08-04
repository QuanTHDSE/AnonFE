import { useCallback, useEffect, useRef, useState } from "react";
import { sharePost, type SharePostResult } from "@/shared/utils/sharePost";

type ShareFeedback = Exclude<SharePostResult, "cancelled"> | "error" | null;

const FEEDBACK_MESSAGES: Record<Exclude<ShareFeedback, null>, string> = {
  shared: "Đã chia sẻ",
  copied: "Đã sao chép liên kết",
  error: "Không thể chia sẻ",
};

export function usePostShare(postId: string | undefined, title: string | undefined) {
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const [isSharing, setIsSharing] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    },
    [],
  );

  const share = useCallback(async () => {
    if (!postId || !title || isSharing) return;

    setIsSharing(true);
    try {
      const result = await sharePost({ postId, title });
      if (result === "cancelled") return;
      setFeedback(result);
    } catch {
      setFeedback("error");
    } finally {
      setIsSharing(false);
    }

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500);
  }, [isSharing, postId, title]);

  return {
    feedbackMessage: feedback ? FEEDBACK_MESSAGES[feedback] : "",
    isSharing,
    share,
  };
}
