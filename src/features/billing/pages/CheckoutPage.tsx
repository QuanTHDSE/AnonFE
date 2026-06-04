import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Vector from "@/imports/Vector";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { subscriptionService, type CreateOrderResponse } from "@/services/subscriptionService";

interface PlanState {
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
}

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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all border border-gray-200 hover:border-orange-200"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? "Đã sao chép" : "Sao chép"}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 text-sm text-right max-w-[200px] break-all">
          {value}
        </span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export function CheckoutView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const plan = (location.state as PlanState | null) ?? null;

  const [isCreating, setIsCreating] = useState(true);
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [createError, setCreateError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !plan?.planId) return;
    setIsCreating(true);
    subscriptionService
      .createOrder(plan.planId)
      .then((res) => setOrder(res))
      .catch((err) =>
        setCreateError(err instanceof Error ? err.message : "Không thể tạo đơn hàng."),
      )
      .finally(() => setIsCreating(false));
  }, []);

  const orderId = order?.orderId ?? order?.id ?? "";
  const bankAccount = order?.bankAccount ?? order?.accountNumber ?? "";
  const bankName = order?.bankName ?? "";
  const accountName = order?.accountName ?? "";
  const transferContent = order?.transferContent ?? order?.content ?? orderId;
  const qrCode = order?.qrCode ?? "";
  const paymentUrl = order?.paymentUrl ?? "";

  const handleCheckStatus = async () => {
    if (!orderId) return;
    setIsChecking(true);
    try {
      const detail = await subscriptionService.getOrder(orderId);
      const status = detail.status;
      if (status === 1 || status === "paid" || status === "completed" || status === "success") {
        setIsPaid(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (!isLoggedIn) return null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-4">Không tìm thấy thông tin gói cước.</p>
          <button
            onClick={() => navigate("/premium")}
            className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl"
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-10 max-w-md w-full text-center border border-gray-100 shadow-xl shadow-green-100/20"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Thanh toán thành công!</h2>
          <p className="text-gray-500 mb-8 font-medium">
            Gói <span className="font-bold text-gray-900">{plan.planName}</span> đã được kích hoạt.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-[#F15B29] text-white font-extrabold rounded-2xl hover:bg-[#d94a1d] transition-all shadow-lg shadow-orange-200"
          >
            Về trang chủ
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
          {/* Payment Section */}
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
              Thanh toán đơn hàng
            </h1>

            {/* Creating order */}
            {isCreating && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4">
                <Loader2 size={36} className="animate-spin text-[#F15B29]" />
                <p className="font-medium text-gray-500">Đang tạo đơn hàng...</p>
              </div>
            )}

            {/* Error */}
            {!isCreating && createError && (
              <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
                <p className="font-bold text-red-500 mb-4">{createError}</p>
                <button
                  onClick={() => navigate("/premium")}
                  className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
                >
                  Chọn lại gói
                </button>
              </div>
            )}

            {/* Order created — show payment instructions */}
            {!isCreating && !createError && order && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* QR Code (if available) */}
                {(qrCode || paymentUrl) && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
                    <h3 className="font-extrabold text-gray-900">Quét mã QR để thanh toán</h3>
                    {qrCode && (
                      <img
                        src={qrCode}
                        alt="QR thanh toán"
                        className="w-56 h-56 object-contain rounded-2xl border border-gray-100"
                      />
                    )}
                    {paymentUrl && !qrCode && (
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-[#F15B29] text-white font-bold rounded-xl hover:bg-[#d94a1d] transition-colors"
                      >
                        Mở trang thanh toán
                      </a>
                    )}
                  </div>
                )}

                {/* Bank Transfer Info */}
                {(bankAccount || transferContent) && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-extrabold text-gray-900 mb-4">Thông tin chuyển khoản</h3>
                    <div className="space-y-1">
                      {bankName && <InfoRow label="Ngân hàng" value={bankName} />}
                      {accountName && <InfoRow label="Tên tài khoản" value={accountName} />}
                      {bankAccount && <InfoRow label="Số tài khoản" value={bankAccount} />}
                      {transferContent && (
                        <InfoRow label="Nội dung chuyển khoản" value={transferContent} />
                      )}
                      <InfoRow
                        label="Số tiền"
                        value={subscriptionService.formatPrice(order.amount ?? plan.price)}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-xs font-bold text-amber-700">
                        ⚠ Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận
                        thanh toán.
                      </p>
                    </div>
                  </div>
                )}

                {/* Order ID fallback */}
                {orderId && !bankAccount && !qrCode && (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-extrabold text-gray-900 mb-4">Thông tin đơn hàng</h3>
                    <InfoRow label="Mã đơn hàng" value={orderId} />
                    <InfoRow
                      label="Số tiền"
                      value={subscriptionService.formatPrice(order.amount ?? plan.price)}
                    />
                  </div>
                )}

                {/* Waiting + Check button */}
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Clock size={20} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Chờ xác nhận thanh toán</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Hệ thống sẽ tự động kích hoạt gói sau khi nhận được thanh toán
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleCheckStatus()}
                    disabled={isChecking}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isChecking ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <RefreshCw size={15} />
                    )}
                    Kiểm tra trạng thái
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
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
                  <span>Thuế (VAT 10%)</span>
                  <span>Đã bao gồm</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-6">
                <span className="font-extrabold text-gray-900">Tổng cộng</span>
                <span className="font-extrabold text-2xl text-[#F15B29]">
                  {subscriptionService.formatPrice(plan.price)}
                </span>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 flex gap-3">
                <Check size={18} className="text-[#F15B29] shrink-0 mt-0.5" strokeWidth={3} />
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Đảm bảo hoàn tiền 7 ngày</p>
                  <p className="text-xs font-medium text-gray-500">
                    Hoàn tiền 100% nếu bạn không hài lòng với trải nghiệm.
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
