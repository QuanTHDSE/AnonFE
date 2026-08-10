import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/services/apiClient";

export function ServerHealthBanner() {
  const [status, setStatus] = useState<"idle" | "warming_up" | "ready">("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 15;

    const pingServer = async () => {
      const isHealthy = await apiClient.checkHealth();

      if (isHealthy) {
        if (attempts > 0 || status === "warming_up") {
          setStatus("ready");
          setVisible(true);
          setTimeout(() => setVisible(false), 3000);
        } else {
          setStatus("idle");
          setVisible(false);
        }
      } else {
        attempts++;
        setStatus("warming_up");
        setVisible(true);

        if (attempts < maxAttempts) {
          timer = setTimeout(pingServer, 3000);
        }
      }
    };

    void pingServer();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          {status === "warming_up" && (
            <div className="flex items-center gap-3 px-5 py-3 bg-amber-500/90 backdrop-blur-md text-white font-bold text-sm rounded-full shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Loader2 size={18} className="animate-spin shrink-0" />
              <span>Đang kết nối máy chủ Render (cold start)... Vui lòng chờ vài giây</span>
            </div>
          )}

          {status === "ready" && (
            <div className="flex items-center gap-2.5 px-5 py-3 bg-emerald-600/95 backdrop-blur-md text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>Máy chủ đã kết nối thành công!</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
