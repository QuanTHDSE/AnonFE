import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ExternalLink, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { userService, type UserProfile, type UpdateUserPayload } from "@/services/userService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Avatar({ user }: { user: UserProfile }) {
  const initials = user.username?.slice(0, 2).toUpperCase() ?? "??";
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.username}
      className="w-8 h-8 rounded-full object-cover border border-gray-100"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-100 flex items-center justify-center">
      <span className="text-xs font-extrabold text-[#F15B29]">{initials}</span>
    </div>
  );
}

export function AdminUsersView() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  const loadUsers = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers(pageNum, PAGE_SIZE);
      setUsers(res.users);
      setFilteredUsers(res.users);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers(page);
  }, [page, loadUsers]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const q = val.trim().toLowerCase();
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
    }, 300);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
      void loadUsers(page);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({ username: user.username, bio: user.bio ?? "", avatarUrl: user.avatarUrl ?? "" });
    setEditError("");
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    setEditError("");
    try {
      await userService.updateUser(editingUser.id, editForm);
      setEditingUser(null);
      void loadUsers(page);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmUser = users.find((u) => u.id === confirmDeleteId);

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý người dùng</h1>
        <p className="text-gray-500 font-medium mt-1">
          {total > 0 ? `${total} người dùng trong hệ thống` : "Đang tải..."}
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm theo tên, email..."
          className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-[#F15B29]/20 focus:border-[#F15B29] transition-all shadow-sm text-sm font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-12 font-bold text-gray-500">#</TableHead>
              <TableHead className="font-bold text-gray-500">Người dùng</TableHead>
              <TableHead className="font-bold text-gray-500">Email</TableHead>
              <TableHead className="font-bold text-gray-500">Alias ẩn danh</TableHead>
              <TableHead className="font-bold text-gray-500">Role</TableHead>
              <TableHead className="font-bold text-gray-500">Ngày tham gia</TableHead>
              <TableHead className="w-28 font-bold text-gray-500" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-6" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                        <div className="h-4 bg-gray-100 rounded w-28" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-gray-100 rounded-full w-14" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-100 rounded w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 bg-gray-100 rounded-xl w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : filteredUsers.map((user, idx) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-bold text-gray-400 text-sm">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar user={user} />
                        <span className="font-semibold text-gray-900 text-sm">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium">
                      {user.anonAlias}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${
                          user.role === "admin"
                            ? "bg-orange-50 text-[#F15B29] border border-orange-100"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-medium">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                          title="Xem hồ sơ"
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {!isLoading && filteredUsers.length === 0 && (
          <div className="py-16 text-center text-gray-400 font-medium">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold transition-colors ${
                    p === page
                      ? "bg-[#F15B29] text-white shadow-md shadow-orange-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="rounded-3xl border-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              Chỉnh sửa: {editingUser?.username}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Tên người dùng</label>
              <input
                type="text"
                value={editForm.username ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium"
                placeholder="Username"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Bio</label>
              <textarea
                value={editForm.bio ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium resize-none"
                placeholder="Giới thiệu bản thân..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Avatar URL</label>
              <input
                type="text"
                value={editForm.avatarUrl ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium"
                placeholder="https://..."
              />
            </div>
            {editError && (
              <p className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {editError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setEditingUser(null)}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-[#F15B29] hover:bg-[#d94a1d] rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="rounded-3xl border-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Xóa người dùng?</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Tài khoản <span className="font-bold text-gray-700">{confirmUser?.username}</span> (
              {confirmUser?.email}) sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <button
              onClick={() => setConfirmDeleteId(null)}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Xóa
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
