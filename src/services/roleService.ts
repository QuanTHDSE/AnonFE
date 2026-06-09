import { apiClient } from "@/services/apiClient";

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface Permission {
  id: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

function toRawList(res: unknown): Record<string, unknown>[] {
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  const obj = res as Record<string, unknown>;
  const list = obj.items ?? obj.roles ?? obj.permissions ?? obj.data ?? obj.results ?? [];
  return (Array.isArray(list) ? list : []) as Record<string, unknown>[];
}

function toList<T>(res: unknown): T[] {
  return toRawList(res) as T[];
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

// Role-permission endpoints may return the join entity (with its own `id` plus a
// `permissionId`) or a nested `permission` object, while the permissions list
// returns the permission's own `id`. Normalize so the same permission resolves
// to the same id from every endpoint — otherwise checkboxes never match.
function normalizePermission(raw: Record<string, unknown>): Permission {
  const nested = raw["permission"] as Record<string, unknown> | undefined;
  const id = str(raw["permissionId"]) ?? str(nested?.["id"]) ?? str(raw["id"]) ?? "";
  const code =
    str(raw["code"]) ??
    str(nested?.["code"]) ??
    str(raw["name"]) ??
    str(raw["permissionCode"]) ??
    str(nested?.["name"]) ??
    "";
  const description = str(raw["description"]) ?? str(nested?.["description"]) ?? null;
  const isActive = (raw["isActive"] as boolean) ?? (nested?.["isActive"] as boolean) ?? true;
  return { id, code, description, isActive };
}

export const roleService = {
  async getRoles(): Promise<Role[]> {
    return toList<Role>(await apiClient.get<unknown>("/api/v1/roles"));
  },

  async createRole(payload: { name: string; description?: string }): Promise<Role> {
    return apiClient.post<Role>("/api/v1/roles", payload);
  },

  async updateRole(id: string, payload: { name: string; description?: string }): Promise<Role> {
    return apiClient.put<Role>(`/api/v1/roles/${id}`, payload);
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/${id}`);
  },

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const res = await apiClient.get<unknown>(`/api/v1/roles/${roleId}/permissions`);
    return toRawList(res)
      .map(normalizePermission)
      .filter((p) => p.id);
  },

  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await apiClient.post(`/api/v1/roles/${roleId}/permissions/${permissionId}`, {});
  },

  // Batch assign — POST /api/v1/roles/{roleId}/permissions with { permissionIds: [...] }
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    await apiClient.post(`/api/v1/roles/${roleId}/permissions`, { permissionIds });
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`);
  },

  async getPermissions(): Promise<Permission[]> {
    const res = await apiClient.get<unknown>("/api/v1/permissions");
    return toRawList(res)
      .map(normalizePermission)
      .filter((p) => p.id);
  },

  async createPermission(payload: {
    code: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Permission> {
    return apiClient.post<Permission>("/api/v1/permissions", { isActive: true, ...payload });
  },

  async updatePermission(
    id: string,
    payload: { code: string; description?: string; isActive?: boolean },
  ): Promise<Permission> {
    return apiClient.put<Permission>(`/api/v1/permissions/${id}`, payload);
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/permissions/${id}`);
  },

  async getUserRoles(userId: string): Promise<Role[]> {
    return toList<Role>(await apiClient.get<unknown>(`/api/v1/users/${userId}/roles`));
  },

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await apiClient.post(`/api/v1/users/${userId}/roles/${roleId}`, {});
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${userId}/roles/${roleId}`);
  },
};
