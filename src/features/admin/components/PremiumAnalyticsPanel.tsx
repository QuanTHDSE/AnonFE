import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  BadgeCheck,
  Clock3,
  Crown,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import { StatsCard } from "@/features/admin/components/StatsCard";
import {
  premiumAnalyticsService,
  type PremiumAnalyticsSummary,
} from "@/services/premiumAnalyticsService";
import { subscriptionService } from "@/services/subscriptionService";
import { UserPremiumBadge } from "@/shared/components/UserPremiumBadge";
import { toAbsoluteMediaUrl } from "@/shared/utils/mediaUrl";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PremiumAnalyticsPanel() {
  const [summary, setSummary] = useState<PremiumAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setSummary(await premiumAnalyticsService.getSummary());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu thống kê Premium.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown size={20} className="text-amber-500" />
            <h2 className="text-xl font-extrabold text-gray-900">Thống kê Premium</h2>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-400">
            Theo dõi người dùng đã mua gói và tình trạng subscription hiện tại.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSummary()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 transition-colors hover:border-orange-200 hover:text-[#F15B29] disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <Link
            to="/admin/subscriptions"
            className="rounded-xl bg-[#F15B29] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#d94a1d]"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button type="button" onClick={() => void loadSummary()} className="text-sm font-bold">
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Đã từng mua Premium"
              value={summary?.totalBuyers ?? 0}
              icon={Users}
              iconBg="bg-amber-50 text-amber-500"
              loading={isLoading}
            />
            <StatsCard
              title="Đang hoạt động"
              value={summary?.activeBuyers ?? 0}
              icon={BadgeCheck}
              iconBg="bg-green-50 text-green-500"
              loading={isLoading}
            />
            <StatsCard
              title="Sắp hết hạn 7 ngày"
              value={summary?.expiringSoonBuyers ?? 0}
              icon={Clock3}
              iconBg="bg-orange-50 text-[#F15B29]"
              loading={isLoading}
            />
            <StatsCard
              title="Tổng lượt đăng ký"
              value={summary?.totalSubscriptions ?? 0}
              icon={ShoppingBag}
              iconBg="bg-purple-50 text-purple-500"
              loading={isLoading}
            />
          </div>

          {summary && summary.failedUserCount > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              <AlertCircle size={16} />
              Chưa đọc được subscription của {summary.failedUserCount} người dùng. Số liệu có thể
              chưa đầy đủ.
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h3 className="font-extrabold text-gray-900">Người mua Premium gần đây</h3>
                <p className="mt-0.5 text-sm font-medium text-gray-400">
                  Subscription mới nhất của từng người dùng
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : summary && summary.recentBuyers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="px-5 py-3">Người dùng</th>
                        <th className="px-5 py-3">Gói</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Bắt đầu</th>
                        <th className="px-5 py-3">Lượt mua</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {summary.recentBuyers.map((buyer) => {
                        const status = subscriptionService.subscriptionStatusLabel(
                          buyer.latestSubscription.status,
                          buyer.latestSubscription.expiresAt,
                        );
                        const statusStyles: Record<string, string> = {
                          green: "bg-green-50 text-green-600",
                          gray: "bg-gray-100 text-gray-500",
                          red: "bg-red-50 text-red-600",
                        };
                        return (
                          <tr key={buyer.userId} className="transition-colors hover:bg-gray-50/60">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-orange-100">
                                  {buyer.avatarUrl ? (
                                    <img
                                      src={toAbsoluteMediaUrl(buyer.avatarUrl) ?? undefined}
                                      alt={buyer.username}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-extrabold text-[#F15B29]">
                                      {buyer.username.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="truncate text-sm font-bold text-gray-900">
                                      {buyer.username}
                                    </p>
                                    <UserPremiumBadge
                                      userId={buyer.userId}
                                      username={buyer.username}
                                    />
                                  </div>
                                  <p className="truncate text-xs text-gray-400">{buyer.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                              {buyer.latestSubscription.planName ?? "Premium"}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status.color] ?? statusStyles.gray}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-gray-500">
                              {formatDate(buyer.latestSubscription.startedAt)}
                            </td>
                            <td className="px-5 py-4 text-center text-sm font-extrabold text-gray-700">
                              {buyer.purchaseCount}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-14 text-center text-sm font-medium text-gray-400">
                  Chưa có người dùng nào mua gói Premium.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-extrabold text-gray-900">Người mua theo gói</h3>
              <p className="mt-0.5 text-sm font-medium text-gray-400">Số người dùng duy nhất</p>

              <div className="mt-6 space-y-4">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                {!isLoading && summary?.planBreakdown.length === 0 && (
                  <p className="py-8 text-center text-sm font-medium text-gray-400">
                    Chưa có dữ liệu gói.
                  </p>
                )}
                {!isLoading &&
                  summary?.planBreakdown.map((plan) => {
                    const percentage = summary.totalBuyers
                      ? Math.round((plan.buyers / summary.totalBuyers) * 100)
                      : 0;
                    return (
                      <div key={plan.planName}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-bold text-gray-700">
                            {plan.planName}
                          </span>
                          <span className="shrink-0 text-xs font-extrabold text-[#F15B29]">
                            {plan.buyers} người
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#F15B29] to-amber-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
