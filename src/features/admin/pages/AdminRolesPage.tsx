import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronRight,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { roleService, type Permission, type Role } from "@/services/roleService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

// ─── Role Form Dialog ─────────────────────────────────────────────────────────
function RoleFormDialog({
  open,
  role,
  onClose,
  onSaved,
}: {
  open: boolean;
  role: Role | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
      setError("");
    }
  }, [open, role]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên role không được để trống.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (role) {
        await roleService.updateRole(role.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await roleService.createRole({ name: name.trim(), description: description.trim() });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {role ? "Chỉnh sửa Role" : "Tạo Role mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            {role ? `Cập nhật thông tin cho role "${role.name}"` : "Thêm role mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Tên role</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vd: Moderator"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả quyền hạn của role..."
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium resize-none"
            />
          </div>
          {error && (
            <p className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
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
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : null}
            {role ? "Lưu thay đổi" : "Tạo Role"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Permission Form Dialog ───────────────────────────────────────────────────
function PermissionFormDialog({
  open,
  permission,
  onClose,
  onSaved,
}: {
  open: boolean;
  permission: Permission | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCode(permission?.code ?? "");
      setDescription(permission?.description ?? "");
      setIsActive(permission?.isActive ?? true);
      setError("");
    }
  }, [open, permission]);

  const handleSave = async () => {
    if (!code.trim()) {
      setError("Code permission không được để trống.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (permission) {
        await roleService.updatePermission(permission.id, {
          code: code.trim(),
          description: description.trim(),
          isActive,
        });
      } else {
        await roleService.createPermission({
          code: code.trim(),
          description: description.trim(),
          isActive,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            {permission ? "Chỉnh sửa Permission" : "Tạo Permission mới"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            {permission
              ? `Cập nhật permission "${permission.code}"`
              : "Thêm permission mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Vd: posts.delete"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-mono font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Mô tả</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả quyền hạn..."
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#F15B29] focus:ring-2 focus:ring-[#F15B29]/10 outline-none transition-all text-sm font-medium"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsActive((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${isActive ? "bg-[#F15B29]" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-5" : "translate-x-1"}`}
              />
            </div>
            <span className="text-sm font-bold text-gray-700">Đang hoạt động</span>
          </label>
          {error && (
            <p className="text-sm font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
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
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : null}
            {permission ? "Lưu thay đổi" : "Tạo Permission"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Roles Tab ────────────────────────────────────────────────────────────────
function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);

  // Staged permissions: savedIds = what's on server, localIds = what user is editing
  const [savedPermIds, setSavedPermIds] = useState<Set<string>>(new Set());
  const [localPermIds, setLocalPermIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDirty =
    localPermIds.size !== savedPermIds.size ||
    [...localPermIds].some((id) => !savedPermIds.has(id));

  const toAdd = [...localPermIds].filter((id) => !savedPermIds.has(id));
  const toRemove = [...savedPermIds].filter((id) => !localPermIds.has(id));

  const loadRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const [r, p] = await Promise.all([roleService.getRoles(), roleService.getPermissions()]);
      setRoles(r);
      setAllPermissions(p);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const selectRole = async (role: Role) => {
    if (isDirty && selectedRole?.id !== role.id) {
      // Discard unsaved changes when switching roles
      setSaveError("");
      setSaveSuccess(false);
    }
    setSelectedRole(role);
    setIsLoadingPerms(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const perms = await roleService.getRolePermissions(role.id);
      const ids = new Set(perms.map((p) => p.id));
      setSavedPermIds(ids);
      setLocalPermIds(new Set(ids));
    } finally {
      setIsLoadingPerms(false);
    }
  };

  const togglePermission = (permId: string) => {
    setSaveSuccess(false);
    setSaveError("");
    setLocalPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole || isSaving) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      // Use batch endpoint for additions, individual DELETE for removals
      if (toAdd.length > 0) {
        await roleService.assignPermissionsToRole(selectedRole.id, toAdd);
      }
      if (toRemove.length > 0) {
        await Promise.all(
          toRemove.map((id) => roleService.removePermissionFromRole(selectedRole.id, id)),
        );
      }
      // Re-fetch from server to confirm what was actually persisted
      const confirmed = await roleService.getRolePermissions(selectedRole.id);
      const confirmedIds = new Set(confirmed.map((p) => p.id));
      setSavedPermIds(confirmedIds);
      setLocalPermIds(new Set(confirmedIds));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Lưu thất bại, vui lòng thử lại.");
      // Revert local to last known saved state
      setLocalPermIds(new Set(savedPermIds));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalPermIds(new Set(savedPermIds));
    setSaveError("");
    setSaveSuccess(false);
  };

  const handleDeleteRole = async () => {
    if (!deletingRoleId) return;
    setIsDeleting(true);
    try {
      await roleService.deleteRole(deletingRoleId);
      if (selectedRole?.id === deletingRoleId) {
        setSelectedRole(null);
        setSavedPermIds(new Set());
        setLocalPermIds(new Set());
      }
      setDeletingRoleId(null);
      void loadRoles();
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingRole = roles.find((r) => r.id === deletingRoleId);

  return (
    <div className="flex gap-6 min-h-[500px]">
      {/* Left: Roles List */}
      <div className="w-80 shrink-0 space-y-3">
        <button
          onClick={() => {
            setEditingRole(null);
            setRoleFormOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F15B29] text-white font-bold text-sm rounded-2xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
        >
          <Plus size={16} />
          Tạo Role mới
        </button>

        {isLoadingRoles ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="py-10 text-center text-gray-400 font-medium text-sm">
            Chưa có role nào
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => void selectRole(role)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedRole?.id === role.id
                    ? "bg-orange-50 border-orange-200"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole?.id === role.id
                        ? "bg-[#F15B29] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Shield size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-gray-400 font-medium truncate">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRole(role);
                      setRoleFormOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingRoleId(role.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight
                    size={14}
                    className={`text-gray-300 transition-transform ${selectedRole?.id === role.id ? "rotate-90" : ""}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Role Permissions */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {!selectedRole ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 p-6">
            <Shield size={48} className="opacity-40" />
            <p className="font-bold text-gray-400">Chọn một role để xem và quản lý permissions</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">{selectedRole.name}</h3>
                {selectedRole.description && (
                  <p className="text-sm text-gray-400 font-medium mt-0.5">
                    {selectedRole.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F15B29] bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                  {localPermIds.size} permissions
                  {isDirty && (
                    <span className="ml-1 text-amber-500">
                      ({toAdd.length > 0 ? `+${toAdd.length}` : ""}
                      {toRemove.length > 0 ? ` -${toRemove.length}` : ""})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Feedback bar */}
            <AnimatePresence>
              {(isDirty || saveError || saveSuccess) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`flex items-center justify-between px-6 py-3 text-sm font-bold ${
                      saveError
                        ? "bg-red-50 border-b border-red-100 text-red-600"
                        : saveSuccess
                          ? "bg-green-50 border-b border-green-100 text-green-600"
                          : "bg-amber-50 border-b border-amber-100 text-amber-700"
                    }`}
                  >
                    <span>
                      {saveError
                        ? saveError
                        : saveSuccess
                          ? "✓ Đã lưu thay đổi thành công"
                          : `Có ${toAdd.length + toRemove.length} thay đổi chưa được lưu`}
                    </span>
                    {isDirty && !isSaving && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDiscard}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-xl transition-colors"
                        >
                          <RotateCcw size={12} />
                          Huỷ thay đổi
                        </button>
                        <button
                          onClick={() => void handleSave()}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-white bg-[#F15B29] hover:bg-[#d94a1d] rounded-xl transition-colors shadow-sm"
                        >
                          <Save size={12} />
                          Lưu thay đổi
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Permissions List */}
            <div className="p-6">
              {isLoadingPerms ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : allPermissions.length === 0 ? (
                <p className="text-gray-400 font-medium text-sm text-center py-10">
                  Chưa có permission nào trong hệ thống
                </p>
              ) : (
                <div className="space-y-2">
                  {allPermissions.map((perm) => {
                    const isLocal = localPermIds.has(perm.id);
                    const wasSaved = savedPermIds.has(perm.id);
                    const changed = isLocal !== wasSaved;
                    return (
                      <motion.div
                        key={perm.id}
                        layout
                        onClick={() => !isSaving && togglePermission(perm.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSaving ? "pointer-events-none opacity-60" : ""
                        } ${
                          isLocal && !changed
                            ? "bg-green-50 border-green-100"
                            : isLocal && changed
                              ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                              : !isLocal && changed
                                ? "bg-red-50 border-red-200 ring-2 ring-red-100"
                                : "bg-gray-50 border-transparent hover:border-gray-200"
                        } ${!perm.isActive ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isLocal ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {isLocal ? <Check size={13} /> : <Lock size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm font-mono truncate">
                              {perm.code}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-gray-400 font-medium truncate">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {changed && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                isLocal ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                              }`}
                            >
                              {isLocal ? "+ Thêm" : "- Gỡ"}
                            </span>
                          )}
                          {!perm.isActive && (
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Save bar at bottom */}
              {isDirty && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleDiscard}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Huỷ thay đổi
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-[#F15B29] hover:bg-[#d94a1d] rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-orange-100"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Lưu thay đổi ({toAdd.length + toRemove.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={roleFormOpen}
        role={editingRole}
        onClose={() => setRoleFormOpen(false)}
        onSaved={() => void loadRoles()}
      />

      {/* Delete Role Dialog */}
      <Dialog open={!!deletingRoleId} onOpenChange={(o) => !o && setDeletingRoleId(null)}>
        <DialogContent className="rounded-3xl border-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Xóa Role?</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Role <span className="font-bold text-gray-700">"{deletingRole?.name}"</span> sẽ bị xóa
              vĩnh viễn. Người dùng được gán role này sẽ mất quyền liên quan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <button
              onClick={() => setDeletingRoleId(null)}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={() => void handleDeleteRole()}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Xóa Role
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Permissions Tab ──────────────────────────────────────────────────────────
function PermissionsTab() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [deletingPermId, setDeletingPermId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      setPermissions(await roleService.getPermissions());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  const handleDelete = async () => {
    if (!deletingPermId) return;
    setIsDeleting(true);
    try {
      await roleService.deletePermission(deletingPermId);
      setDeletingPermId(null);
      void loadPermissions();
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingPerm = permissions.find((p) => p.id === deletingPermId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          {permissions.length} permissions trong hệ thống
        </p>
        <button
          onClick={() => {
            setEditingPerm(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F15B29] text-white font-bold text-sm rounded-2xl hover:bg-[#d94a1d] transition-colors shadow-md shadow-orange-100"
        >
          <Plus size={15} />
          Tạo Permission
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : permissions.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium">Chưa có permission nào</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      perm.isActive ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Lock size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm font-mono">{perm.code}</p>
                    {perm.description && (
                      <p className="text-xs text-gray-400 font-medium truncate">
                        {perm.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      perm.isActive
                        ? "bg-green-50 text-green-600 border border-green-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {perm.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPerm(perm);
                      setFormOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-[#F15B29] hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingPermId(perm.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PermissionFormDialog
        open={formOpen}
        permission={editingPerm}
        onClose={() => setFormOpen(false)}
        onSaved={() => void loadPermissions()}
      />

      <Dialog open={!!deletingPermId} onOpenChange={(o) => !o && setDeletingPermId(null)}>
        <DialogContent className="rounded-3xl border-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Xóa Permission?</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Permission{" "}
              <span className="font-bold text-gray-700 font-mono">"{deletingPerm?.code}"</span> sẽ
              bị xóa vĩnh viễn khỏi hệ thống và tất cả các role.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <button
              onClick={() => setDeletingPermId(null)}
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
              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── User Role Assignment Dialog (exported for use in AdminUsersPage) ─────────
export function UserRoleDialog({
  open,
  userId,
  username,
  onClose,
}: {
  open: boolean;
  userId: string;
  username: string;
  onClose: () => void;
}) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    Promise.all([roleService.getRoles(), roleService.getUserRoles(userId)])
      .then(([all, user]) => {
        setAllRoles(all);
        setUserRoles(user);
      })
      .finally(() => setIsLoading(false));
  }, [open, userId]);

  const toggleRole = async (role: Role) => {
    if (togglingId) return;
    const has = userRoles.some((r) => r.id === role.id);
    setTogglingId(role.id);
    try {
      if (has) {
        await roleService.removeRoleFromUser(userId, role.id);
        setUserRoles((prev) => prev.filter((r) => r.id !== role.id));
      } else {
        await roleService.assignRoleToUser(userId, role.id);
        setUserRoles((prev) => [...prev, role]);
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl border-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Quản lý Roles</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            Gán hoặc gỡ roles cho người dùng{" "}
            <span className="font-bold text-gray-700">"{username}"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2 min-h-[120px]">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : allRoles.length === 0 ? (
            <p className="text-center text-gray-400 font-medium text-sm py-6">
              Chưa có role nào trong hệ thống
            </p>
          ) : (
            allRoles.map((role) => {
              const has = userRoles.some((r) => r.id === role.id);
              const isToggling = togglingId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => void toggleRole(role)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                    has
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        has ? "bg-[#F15B29] text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : has ? (
                        <Check size={13} />
                      ) : (
                        <Shield size={13} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{role.name}</p>
                      {role.description && (
                        <p className="text-xs text-gray-400 font-medium">{role.description}</p>
                      )}
                    </div>
                  </div>
                  {has && <X size={14} className="text-[#F15B29] shrink-0" />}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "roles" | "permissions";

export function AdminRolesView() {
  const [activeTab, setActiveTab] = useState<Tab>("roles");

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Phân quyền hệ thống
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Quản lý Roles và Permissions, gán quyền cho từng role
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {(["roles", "permissions"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "roles" ? "Roles" : "Permissions"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "roles" ? <RolesTab /> : <PermissionsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
