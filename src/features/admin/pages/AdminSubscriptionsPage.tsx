import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Crown,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { subscriptionService, type UserSubscription } from "@/services/subscriptionService";
import { userService, type UserProfile } from "@/services/userService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status, expiresAt }: { status: number; expiresAt: string }) {
  const { label, color } = subscriptionService.subscriptionStatusLabel(status, expiresAt);
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-500",
    red: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${styles[color] ?? styles.gray}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-gray-400"
        }`}
      />
      {label}
    </span>
  );
}

function UserCard({
  user,
  isSelected,
  onClick,
}: {
  user: UserProfile;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors border ${
        isSelected
          ? "bg-orange-50 border-orange-200"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
        <span className="font-bold text-[#F15B29] text-sm">
          {(user.username ?? user.email).slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 text-sm truncate">{user.username}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      {isSelected && <BadgeCheck size={16} className="text-[#F15B29] shrink-0" />}
    </motion.div>
  );
}

function SubscriptionRow({
  sub,
  onDelete,
}: {
  sub: UserSubscription;
  onDelete: (sub: UserSubscription) => void;
}) {
  const days = subscriptionService.daysRemaining(sub.expiresAt);
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Crown size={14} className="text-[#F15B29]" />
          <span className="font-semibold text-gray-900 text-sm">{sub.planName ?? "Premium"}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={sub.status} expiresAt={sub.expiresAt} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <CalendarDays size={13} className="text-gray-400" />
          {formatDate(sub.startedAt)}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm text-gray-600">{formatDate(sub.expiresAt)}</p>
          {days > 0 && <p className="text-xs text-gray-400 mt-0.5">còn {days} ngày</p>}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(sub)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Xóa subscription"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function AdminSubscriptionsView() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [subsError, setSubsError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserSubscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load all users on mount
  useEffect(() => {
    userService
      .getUsers(1, 100)
      .then((res) => {
        const list = res.users ?? [];
        setUsers(list);
        setFilteredUsers(list);
      })
      .catch(() => {})
      .finally(() => setIsLoadingUsers(false));
  }, []);

  // Filter users by search
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      q
        ? users.filter(
            (u) =>
              u.username?.toLowerCase().includes(q) ||
              u.email?.toLowerCase().includes(q) ||
              u.anonAlias?.toLowerCase().includes(q),
          )
        : users,
    );
  }, [search, users]);

  // Load subscriptions when user selected
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSubs([]);
    setSubsError("");
    setIsLoadingSubs(true);
    subscriptionService
      .getUserSubscriptions(user.id, 1, 50)
      .then((res) => setSubs(res.items ?? []))
      .catch(() => setSubsError("Không thể tải danh sách gói cước."))
      .finally(() => setIsLoadingSubs(false));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await subscriptionService.deleteSubscription(deleteTarget.id);
      setSubs((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep dialog open on error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Tìm người dùng và xem lịch sử đăng ký gói cước</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left: User picker */}
        <div className="w-full xl:w-80 shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-extrabold text-gray-900 mb-4">Chọn người dùng</h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email..."
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F15B29] focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* User list */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {isLoadingUsers &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            {!isLoadingUsers && filteredUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 font-medium">
                Không tìm thấy người dùng
              </p>
            )}
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onClick={() => handleSelectUser(user)}
              />
            ))}
          </div>
        </div>

        {/* Right: Subscriptions */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-gray-900">
                {selectedUser ? `Gói cước của ${selectedUser.username}` : "Gói cước"}
              </h2>
              {!selectedUser && (
                <p className="text-sm text-gray-400 mt-0.5">Chọn người dùng bên trái để xem</p>
              )}
            </div>
            {subs.length > 0 && (
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                {subs.length} gói
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* No user selected */}
              {!selectedUser && (
                <motion.div
                  key="empty-select"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-16 text-center"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                    <Crown size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium text-sm">
                    Chọn người dùng để xem subscription
                  </p>
                </motion.div>
              )}

              {/* Loading */}
              {selectedUser && isLoadingSubs && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-16 gap-3 text-gray-400"
                >
                  <Loader2 size={20} className="animate-spin" />
                  <span className="font-medium text-sm">Đang tải...</span>
                </motion.div>
              )}

              {/* Error */}
              {selectedUser && !isLoadingSubs && subsError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl text-red-500"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{subsError}</span>
                </motion.div>
              )}

              {/* Empty */}
              {selectedUser && !isLoadingSubs && !subsError && subs.length === 0 && (
                <motion.div
                  key="empty-subs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Crown size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-medium text-sm">
                    Người dùng này chưa có gói cước nào
                  </p>
                </motion.div>
              )}

              {/* Table */}
              {selectedUser && !isLoadingSubs && !subsError && subs.length > 0 && (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Gói</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-left">Bắt đầu</th>
                        <th className="px-4 py-3 text-left">Hết hạn</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {isLoadingSubs
                        ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                        : subs.map((sub) => (
                            <SubscriptionRow key={sub.id} sub={sub} onDelete={setDeleteTarget} />
                          ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa subscription</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa gói{" "}
              <span className="font-bold text-gray-900">{deleteTarget?.planName ?? "Premium"}</span>{" "}
              của người dùng này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting && <Loader2 size={14} className="animate-spin" />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
