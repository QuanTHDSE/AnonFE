import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Globe,
  History,
  KeyRound,
  Laptop,
  RefreshCw,
  Search,
  Shield,
  Star,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { activityLogService, ActivityLogItem } from "@/services/activityLogService";

const CATEGORIES = [
  {
    id: "all",
    label: "Tất cả",
    icon: Activity,
    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  {
    id: "Auth",
    label: "Xác thực",
    icon: KeyRound,
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "Post",
    label: "Bài viết",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  {
    id: "User",
    label: "Người dùng",
    icon: User,
    color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
  {
    id: "Rating",
    label: "Đánh giá",
    icon: Star,
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  {
    id: "Payment",
    label: "Thanh toán",
    icon: CreditCard,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  },
  {
    id: "Admin",
    label: "Hệ thống",
    icon: Shield,
    color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  },
];

export function AdminActivityLogsView() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getActivityLogs({
        page,
        pageSize,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: activeSearch || undefined,
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, selectedCategory, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "auth":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "post":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "user":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "rating":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "payment":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "admin":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("SUCCESS"))
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (action.includes("DELETE")) return "text-rose-600 bg-rose-50 border-rose-200";
    if (action.includes("UPDATE") || action.includes("CHANGE"))
      return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F15B29] to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-200">
              <History size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Nhật ký Hoạt động (Activity Logs)
              </h1>
              <p className="text-xs font-medium text-gray-500">
                Theo dõi & giám sát toàn bộ vết thao tác của người dùng và hệ thống
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#F15B29]" : ""} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F15B29] flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tổng số Nhật ký
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <KeyRound size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Loại Phân Loại
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">7 Danh mục</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Trạng thái Ghi vết
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">Tự động</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Trang hiện tại
            </p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">
              {page} / {totalPages || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} /> Lọc:
            </span>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? "bg-[#F15B29] text-white border-[#F15B29] shadow-sm shadow-orange-100"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-72">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm hành động, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#F15B29] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shrink-0"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#F15B29] mx-auto" />
            <p className="text-xs font-bold text-gray-500">Đang tải nhật ký hoạt động...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <History size={24} />
            </div>
            <p className="text-sm font-bold text-gray-800">Không tìm thấy nhật ký hoạt động nào</p>
            <p className="text-xs text-gray-400">Hãy thử thay đổi từ khóa hoặc bộ lọc danh mục</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-5">Thời gian</th>
                  <th className="py-3.5 px-4">Phân loại</th>
                  <th className="py-3.5 px-4">Hành động</th>
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-5">Mô tả</th>
                  <th className="py-3.5 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Timestamp */}
                    <td className="py-4 px-5 whitespace-nowrap text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{formatTimestamp(log.createdAt)}</span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getCategoryBadge(
                          log.actionCategory,
                        )}`}
                      >
                        {log.actionCategory}
                      </span>
                    </td>

                    {/* Action Code */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border uppercase tracking-wider ${getActionColor(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* User Username / Alias */}
                    <td className="py-4 px-4 whitespace-nowrap font-bold text-gray-900">
                      {log.userUsername ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-[#F15B29] font-black text-[10px] flex items-center justify-center">
                            {log.userUsername[0].toUpperCase()}
                          </div>
                          <span>@{log.userUsername}</span>
                        </div>
                      ) : log.userId ? (
                        <span className="text-gray-500 font-mono text-[11px]">
                          ID: {log.userId.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Khách / Hệ thống</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-5 max-w-md">
                      <p className="text-gray-800 font-medium line-clamp-2 leading-relaxed">
                        {log.description}
                      </p>
                    </td>

                    {/* Action button: View details */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-orange-50 hover:text-[#F15B29] transition-all inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye size={13} />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && logs.length > 0 && (
          <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-600">
            <div>
              Hiển thị <span className="font-extrabold text-gray-900">{logs.length}</span> /{" "}
              <span className="font-extrabold text-gray-900">{total}</span> nhật ký hoạt động
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 mr-2">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F15B29] flex items-center justify-center">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      Chi tiết Nhật ký Hoạt động
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Mã nhật ký: {selectedLog.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs font-medium">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      Hành động
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border uppercase tracking-wider ${getActionColor(
                        selectedLog.action,
                      )}`}
                    >
                      {selectedLog.action}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      Phân loại
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryBadge(
                        selectedLog.actionCategory,
                      )}`}
                    >
                      {selectedLog.actionCategory}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      Người thực hiện
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedLog.userUsername
                        ? `@${selectedLog.userUsername}`
                        : selectedLog.userId
                          ? selectedLog.userId
                          : "Hệ thống / Vô danh"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      Thời gian khởi tạo
                    </p>
                    <p className="font-bold text-gray-900 text-sm">
                      {formatTimestamp(selectedLog.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                    Mô tả chi tiết
                  </p>
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-gray-800 font-semibold text-xs leading-relaxed">
                    {selectedLog.description}
                  </div>
                </div>

                {/* Target Type & Target Id */}
                {(selectedLog.targetType || selectedLog.targetId) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                        Loại Đối tượng (Target Type)
                      </p>
                      <p className="font-bold text-gray-800 font-mono">
                        {selectedLog.targetType || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                        Mã Đối tượng (Target ID)
                      </p>
                      <p className="font-bold text-gray-800 font-mono break-all">
                        {selectedLog.targetId || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* IP & User Agent */}
                {(selectedLog.ipAddress || selectedLog.userAgent) && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    {selectedLog.ipAddress && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe size={14} className="text-gray-400 shrink-0" />
                        <span className="font-bold">Địa chỉ IP:</span>
                        <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {selectedLog.ipAddress}
                        </span>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <Laptop size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Thiết bị / Trình duyệt:</span>
                          <p className="font-mono text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mt-1 break-all">
                            {selectedLog.userAgent}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw JSON Details */}
                {selectedLog.detailsJson && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Code size={12} /> Dữ liệu chi tiết dạng JSON (DetailsJson)
                    </p>
                    <pre className="bg-gray-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed border border-gray-800">
                      {selectedLog.detailsJson}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
