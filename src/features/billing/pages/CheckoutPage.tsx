import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Vector from "@/imports/Vector";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getErrorMessage } from "@/services/apiClient";
import {
  subscriptionService,
  parseSepayQrUrl,
  type CreateOrderResponse,
} from "@/services/subscriptionService";

interface PlanState {
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
}

const SKIP_DISPLAY_KEYS = new Set([
  "orderId",
  "id",
  "orderCode",
  "referenceCode",
  "qrCode",
  "qrCodeUrl",
  "qrImage",
  "paymentUrl",
  "checkoutUrl",
]);

function formatDuration(days: number): string {
  if (days >= 365) return `${Math.round(days / 365)} năm`;
  if (days >= 30) return `${Math.round(days / 30)} tháng`;
  return `${days} ngày`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all border border-gray-200 hover:border-orange-200 shrink-0"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? "Đã sao chép" : "Sao chép"}
    </button>
  );
}

function InfoRow({
  label,
  value,
  copyable = true,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
      <span className="text-sm font-medium text-gray-500 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-gray-900 text-sm text-right break-all">{value}</span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

/** Render any unknown fields from API response as InfoRows */
function UnknownFields({ order }: { order: CreateOrderResponse }) {
  const knownKeys = new Set([
    "orderId",
    "id",
    "orderCode",
    "referenceCode",
    "amount",
    "transferAmount",
    "price",
    "bankAccount",
    "accountNumber",
    "bankName",
    "accountName",
    "bankCode",
    "transferContent",
    "content",
    "description",
    "memo",
    "qrCode",
    "qrCodeUrl",
    "qrImage",
    "paymentUrl",
    "checkoutUrl",
    "status",
    "planName",
    "planId",
    "userId",
    "createdAt",
    "expiredAt",
    "paidAt",
  ]);
  const extras = Object.entries(order).filter(
    ([k, v]) => !knownKeys.has(k) && v != null && typeof v !== "object" && String(v).trim() !== "",
  );
  if (!extras.length) return null;
  return (
    <>
      {extras.map(([key, value]) => (
        <InfoRow
          key={key}
          label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
          value={String(value)}
        />
      ))}
    </>
  );
}

export function CheckoutView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const plan = (location.state as PlanState | null) ?? null;

  const [isCreating, setIsCreating] = useState(true);
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [createError, setCreateError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [checkMsg, setCheckMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create order on mount
  useEffect(() => {
    if (!isLoggedIn || !plan?.planId) {
      setIsCreating(false);
      return;
    }

    subscriptionService
      .createOrder(plan.planId)
      .then((res) => {
        console.log("[Checkout] create-order response:", JSON.stringify(res, null, 2));
        setOrder(res);
      })
      .catch((err: unknown) =>
        setCreateError(getErrorMessage(err, "Không thể tạo đơn hàng. Vui lòng thử lại.")),
      )
      .finally(() => setIsCreating(false));

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  // Auto-poll every 15 seconds after order created
  useEffect(() => {
    if (!order || isPaid) return;
    const oid = subscriptionService.extractOrderId(order);
    console.log("[Checkout] orderId for polling:", oid || "(empty — polling skipped)");
    if (!oid) return;

    const scheduleNext = () => {
      pollRef.current = setTimeout(async () => {
        try {
          const detail = await subscriptionService.getOrder(oid);
          console.log("[Checkout] getOrder response:", JSON.stringify(detail, null, 2));
          if (subscriptionService.isPaidStatus(detail.status)) {
            setIsPaid(true);
            return;
          }
        } catch {
          // ignore poll errors
        }
        setPollCount((c) => c + 1);
        scheduleNext();
      }, 15_000);
    };
    scheduleNext();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [order, isPaid]);

  const orderId = order ? subscriptionService.extractOrderId(order) : "";

  // Parse SePay QR URL as fallback when bank fields are null
  const rawQrUrl = order
    ? ((order.qrUrl ?? order.qrCode ?? order.qrCodeUrl ?? order.qrImage ?? "") as string)
    : "";
  const sepayInfo = rawQrUrl ? parseSepayQrUrl(rawQrUrl) : null;

  const amount = order
    ? sepayInfo?.amount || subscriptionService.extractAmount(order, plan?.price ?? 0)
    : (plan?.price ?? 0);
  const bankAccount = order
    ? ((order.bankAccount ?? order.accountNumber ?? sepayInfo?.accountNumber ?? "") as string)
    : "";
  const bankName = order ? ((order.bankName ?? sepayInfo?.bankName ?? "") as string) : "";
  const accountName = order ? ((order.accountName ?? "") as string) : "";
  const transferContent = order
    ? ((order.transferContent ??
        order.content ??
        order.description ??
        order.memo ??
        sepayInfo?.transferContent ??
        "") as string)
    : "";
  const qrCode = rawQrUrl;
  const paymentUrl = order ? ((order.paymentUrl ?? order.checkoutUrl ?? "") as string) : "";

  const handleCheckNow = async () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setIsChecking(true);
    setCheckMsg("");
    let found = false;

    // 1. Check by orderId
    if (orderId) {
      try {
        const detail = await subscriptionService.getOrder(orderId);
        console.log("[Checkout] manual getOrder:", JSON.stringify(detail, null, 2));
        if (subscriptionService.isPaidStatus(detail.status)) {
          setIsPaid(true);
          found = true;
        }
      } catch (e) {
        console.warn("[Checkout] getOrder error:", e);
      }
    }

    // 2. Fallback: check user subscriptions for an active one created recently
    if (!found && user?.id) {
      try {
        const subs = await subscriptionService.getUserSubscriptions(user.id, 1, 5);
        console.log("[Checkout] user subscriptions:", JSON.stringify(subs, null, 2));
        const now = new Date();
        const active = subs.items?.find((s) => {
          const notExpired = s.expiresAt ? new Date(s.expiresAt) > now : true;
          const isActive = subscriptionService.isPaidStatus(s.status);
          return notExpired && isActive;
        });
        if (active) {
          setIsPaid(true);
          found = true;
        } else if (subs.items?.length) {
          setCheckMsg("Đơn hàng đang chờ xử lý. Vui lòng đợi thêm.");
        } else {
          setCheckMsg("Chưa nhận được thanh toán. Vui lòng đợi thêm vài phút.");
        }
      } catch (e) {
        console.warn("[Checkout] getUserSubscriptions error:", e);
        setCheckMsg("Không thể kiểm tra. Vui lòng thử lại.");
      }
    }

    setIsChecking(false);
  };

  if (!isLoggedIn) return null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-4">Không tìm thấy thông tin gói cước.</p>
          <button
            onClick={() => navigate("/premium")}
            className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
          >
            Quay lại chọn gói
          </button>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-10 max-w-md w-full text-center border border-gray-100 shadow-2xl shadow-green-100/30"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-500 mb-2 font-medium">
            Gói <span className="font-bold text-gray-900">{plan.planName}</span> đã được kích hoạt.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Hiệu lực: {formatDuration(plan.durationDays)}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200 mb-3"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate("/premium")}
            className="w-full py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors text-sm"
          >
            Xem các gói khác
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-orange-100 selection:text-[#F15B29]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/premium")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#F15B29] transition-colors group p-2 -ml-2 rounded-xl"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold hidden sm:block">Quay lại</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <Vector />
            </div>
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">AnonWork</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Bảo mật</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left: Payment instructions */}
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
              Thanh toán đơn hàng
            </h1>

            {/* Creating order */}
            <AnimatePresence mode="wait">
              {isCreating && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 flex flex-col items-center gap-4"
                >
                  <Loader2 size={36} className="animate-spin text-[#F15B29]" />
                  <p className="font-medium text-gray-500">Đang tạo đơn hàng...</p>
                </motion.div>
              )}

              {/* Error */}
              {!isCreating && createError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-3xl p-8 flex flex-col items-center gap-4 text-center"
                >
                  <XCircle size={40} className="text-red-400" />
                  <div>
                    <p className="font-bold text-red-500 mb-1">Tạo đơn hàng thất bại</p>
                    <p className="text-sm text-red-400">{createError}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => navigate("/premium")}
                      className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors text-sm shadow-md shadow-orange-200"
                    >
                      Xem các gói cước
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Order ready */}
              {!isCreating && !createError && order && (
                <motion.div
                  key="order"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* QR Code */}
                  {(qrCode || paymentUrl) && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
                      <h3 className="font-extrabold text-gray-900 text-lg">
                        Quét mã QR để thanh toán
                      </h3>
                      {qrCode && (
                        <img
                          src={qrCode}
                          alt="QR thanh toán"
                          className="w-60 h-60 object-contain rounded-2xl border border-gray-100 bg-white p-2"
                        />
                      )}
                      {paymentUrl && (
                        <a
                          href={paymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
                        >
                          <ExternalLink size={16} />
                          Mở trang thanh toán
                        </a>
                      )}
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {(bankAccount || transferContent || bankName) && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-extrabold text-gray-900 text-lg mb-4">
                        Thông tin chuyển khoản
                      </h3>
                      <div className="space-y-0.5">
                        {bankName && (
                          <InfoRow label="Ngân hàng" value={bankName} copyable={false} />
                        )}
                        {accountName && (
                          <InfoRow label="Tên tài khoản" value={accountName} copyable={false} />
                        )}
                        {bankAccount && <InfoRow label="Số tài khoản" value={bankAccount} />}
                        {transferContent && (
                          <InfoRow label="Nội dung chuyển khoản" value={transferContent} />
                        )}
                        <InfoRow label="Số tiền" value={subscriptionService.formatPrice(amount)} />
                        <UnknownFields order={order} />
                      </div>
                      <div className="mt-5 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
                        <p className="text-xs font-bold text-amber-700 leading-relaxed">
                          ⚠ Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận
                          thanh toán. Không thay đổi nội dung!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Fallback: only orderId available */}
                  {orderId && !bankAccount && !qrCode && !transferContent && !bankName && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-extrabold text-gray-900 text-lg mb-4">
                        Thông tin đơn hàng
                      </h3>
                      <div className="space-y-0.5">
                        <InfoRow label="Mã đơn hàng" value={orderId} />
                        <InfoRow label="Số tiền" value={subscriptionService.formatPrice(amount)} />
                        <UnknownFields order={order} />
                      </div>
                    </div>
                  )}

                  {/* Waiting + Check */}
                  <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Clock size={20} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Chờ xác nhận thanh toán</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Hệ thống tự động kiểm tra mỗi 15 giây
                            {pollCount > 0 && (
                              <span className="ml-1 text-blue-400">
                                (đã kiểm tra {pollCount} lần)
                              </span>
                            )}
                          </p>
                          {checkMsg && (
                            <p className="text-xs font-bold text-amber-600 mt-1.5">{checkMsg}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => void handleCheckNow()}
                        disabled={isChecking}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 shrink-0"
                      >
                        {isChecking ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                        Kiểm tra ngay
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-100/50 sticky top-28">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

              <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">{plan.planName}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={13} />
                    Hiệu lực {formatDuration(plan.durationDays)}
                  </p>
                </div>
                <p className="font-extrabold text-[#F15B29] text-lg">
                  {subscriptionService.formatPrice(plan.price)}
                </p>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tạm tính</span>
                  <span>{subscriptionService.formatPrice(plan.price)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>VAT</span>
                  <span>Đã bao gồm</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-6">
                <span className="font-extrabold text-gray-900">Tổng cộng</span>
                <span className="font-extrabold text-2xl text-[#F15B29]">
                  {subscriptionService.formatPrice(plan.price)}
                </span>
              </div>

              {orderId && (
                <div className="mb-5 p-3 bg-gray-50 rounded-2xl">
                  <p className="text-xs text-gray-400 font-medium mb-1">Mã đơn hàng</p>
                  <p className="text-xs font-bold text-gray-600 break-all">{orderId}</p>
                </div>
              )}

              <div className="bg-orange-50 rounded-2xl p-4 flex gap-3">
                <Check size={18} className="text-[#F15B29] shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Đảm bảo hoàn tiền 7 ngày</p>
                  <p className="text-xs font-medium text-gray-500">
                    Hoàn tiền 100% nếu bạn không hài lòng.
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
