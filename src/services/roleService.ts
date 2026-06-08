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

function toList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const obj = res as Record<string, unknown>;
  const list = obj.items ?? obj.roles ?? obj.permissions ?? obj.data ?? obj.results ?? [];
  return (Array.isArray(list) ? list : []) as T[];
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
    return toList<Permission>(await apiClient.get<unknown>(`/api/v1/roles/${roleId}/permissions`));
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
    return toList<Permission>(await apiClient.get<unknown>("/api/v1/permissions"));
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
