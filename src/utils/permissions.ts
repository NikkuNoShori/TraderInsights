import type { UserRole, UserPermissions } from "@/types/auth";

const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canAccessDashboard: true,
    canAccessJournal: true,
    canAccessAnalytics: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewAuditLogs: true,
    canModifySystemSettings: true,
  },
  user: {
    canAccessDashboard: true,
    canAccessJournal: true,
    canAccessAnalytics: false,
    canManageUsers: false,
    canManageRoles: false,
    canViewAuditLogs: false,
    canModifySystemSettings: false,
  },
  developer: {
    canAccessDashboard: true,
    canAccessJournal: true,
    canAccessAnalytics: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewAuditLogs: true,
    canModifySystemSettings: true,
  },
};

export const getPermissionsForRole = (role: UserRole): UserPermissions => {
  return rolePermissions[role];
};

export const hasPermission = (
  permissions: UserPermissions,
  permission: keyof UserPermissions,
): boolean => {
  return permissions[permission];
};
