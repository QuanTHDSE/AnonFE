import { useEffect, useState } from "react";
import { Crown, CalendarDays, Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { PremiumBadge } from "@/shared/components/PremiumBadge";
import { subscriptionService, type UserSubscription } from "@/services/subscriptionService";

interface SubscriptionPeekDialogProps {
  userId: string;
  displayName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const STATUS_COLORS: Record<string, string> = {
  green: "bg-green-50 text-green-600 border-green-100",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
  red: "bg-red-50 text-red-600 border-red-100",
};

/** Lets any logged-in user peek at another user's subscription (plan, status, expiry). */
export function SubscriptionPeekDialog({
  userId,
  displayName,
  open,
  onOpenChange,
}: SubscriptionPeekDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState<UserSubscription | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    subscriptionService
      .getPublicSubscription(userId)
      .then((res) => {
        if (cancelled) return;
        setSub(res);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const status = sub
    ? subscriptionService.subscriptionStatusLabel(sub.status, sub.expiresAt)
    : null;
  const daysLeft =
    sub && status?.color === "green" ? subscriptionService.daysRemaining(sub.expiresAt) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
            <Crown size={20} className="text-[#F15B29]" />
            Gói đăng ký
          </DialogTitle>
          <DialogDescription className="font-medium">
            Thông tin gói đăng ký của <span className="font-bold text-gray-700">{displayName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : sub ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <PremiumBadge size={18} />
                  <span className="font-extrabold text-gray-900 text-lg">
                    {sub.planName ?? "Premium"}
                  </span>
                </div>
                {status && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      STATUS_COLORS[status.color] ?? STATUS_COLORS.gray
                    }`}
                  >
                    {status.label}
                  </span>
                )}
              </div>
              {daysLeft !== null && (
                <p className="text-sm font-semibold text-[#F15B29] flex items-center gap-1.5 mt-2">
                  <Clock size={14} />
                  Còn {daysLeft} ngày
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <CalendarDays size={13} />
                  Bắt đầu
                </p>
                <p className="font-bold text-gray-900 text-sm">{formatDate(sub.startedAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <CalendarDays size={13} />
                  Hết hạn
                </p>
                <p className="font-bold text-gray-900 text-sm">{formatDate(sub.expiresAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          loaded && (
            <div className="py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Crown size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">
                Không xem được thông tin gói đăng ký của người dùng này.
              </p>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
