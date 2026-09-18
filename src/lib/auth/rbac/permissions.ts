/**
 * ==============================================================================
 * INDOPHARM — ROLE-BASED ACCESS CONTROL (RBAC) PERMISSION MATRIX
 * ==============================================================================
 * Maps primary application roles to granular resource permissions.
 * Never use "admin === user" or a simple "isAdmin = true" boolean flag.
 * Server-side authorization evaluates: Role -> Permission -> Resource Ownership.
 * ==============================================================================
 */

import { UserRole } from '@prisma/client';

export type Permission =
  // Product catalog
  | 'product:read'
  | 'product:create'
  | 'product:update'
  | 'product:archive'
  // Inventory & batches
  | 'inventory:read'
  | 'inventory:manage'
  | 'inventory:adjust'
  | 'batch:read'
  | 'batch:manage'
  // Orders
  | 'order:read_own'
  | 'order:read_all'
  | 'order:update'
  | 'order:fulfill'
  | 'order:fulfillment'
  // Payments
  | 'payment:read_own'
  | 'payment:read_all'
  | 'payment:capture'
  | 'payment:refund'
  // Prescriptions & ePHI
  | 'prescription:upload'
  | 'prescription:read_own'
  | 'prescription:read_all'
  | 'prescription:review'
  | 'prescription:verify'
  // Customer Support
  | 'support:create'
  | 'support:read_own'
  | 'support:read_all'
  | 'support:update'
  // User & Identity
  | 'user:read_own'
  | 'user:update_own'
  | 'user:manage_all'
  | 'user:manage_role'
  | 'role:manage'
  // Compliance & Regulatory
  | 'compliance:read'
  | 'compliance:manage'
  | 'compliance:rule_manage'
  | 'country_rule:manage'
  // Audit & Security
  | 'audit:read'
  | 'security:manage'
  | 'admin:access'
  // Dashboard & BI Command Center
  | 'dashboard:read'
  | 'dashboard:financial:read'
  | 'dashboard:orders:read'
  | 'dashboard:prescription:read'
  | 'dashboard:inventory:read'
  | 'dashboard:customer:read'
  | 'dashboard:analytics:read'
  | 'dashboard:refund:read';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  PATIENT: [
    'product:read',
    'order:read_own',
    'payment:read_own',
    'prescription:upload',
    'prescription:read_own',
    'support:create',
    'support:read_own',
    'user:read_own',
    'user:update_own',
  ],

  OPS_WAREHOUSE: [
    'product:read',
    'inventory:read',
    'inventory:manage',
    'inventory:adjust',
    'batch:read',
    'batch:manage',
    'order:read_all',
    'order:fulfill',
    'order:fulfillment',
    'payment:read_all',
    'payment:capture',
    'support:read_all',
    'user:read_own',
    'dashboard:read',
    'dashboard:orders:read',
    'dashboard:inventory:read',
  ],

  CLINICAL_PHARMACIST: [
    'product:read',
    'order:read_all',
    'prescription:read_all',
    'prescription:review',
    'prescription:verify',
    'compliance:read',
    'compliance:manage',
    'compliance:rule_manage',
    'country_rule:manage',
    'audit:read',
    'user:read_own',
    'dashboard:read',
    'dashboard:prescription:read',
    'dashboard:orders:read',
  ],

  COMPLIANCE_ADMIN: [
    'product:read',
    'order:read_all',
    'payment:read_all',
    'payment:capture',
    'prescription:read_all',
    'prescription:review',
    'prescription:verify',
    'compliance:read',
    'compliance:manage',
    'compliance:rule_manage',
    'country_rule:manage',
    'audit:read',
    'user:read_own',
    'dashboard:read',
    'dashboard:prescription:read',
    'dashboard:orders:read',
    'dashboard:analytics:read',
  ],

  SUPPORT_AGENT: [
    'product:read',
    'order:read_all',
    'support:read_all',
    'support:update',
    'payment:read_all',
    'user:read_own',
    'dashboard:read',
    'dashboard:orders:read',
    'dashboard:customer:read',
  ],

  ADMIN: [
    'admin:access',
    'product:read',
    'product:create',
    'product:update',
    'product:archive',
    'inventory:read',
    'inventory:manage',
    'inventory:adjust',
    'batch:read',
    'batch:manage',
    'order:read_all',
    'order:update',
    'order:fulfill',
    'order:fulfillment',
    'payment:read_all',
    'payment:capture',
    'payment:refund',
    'prescription:read_all',
    'prescription:review',
    'support:read_all',
    'support:update',
    'compliance:read',
    'compliance:manage',
    'compliance:rule_manage',
    'country_rule:manage',
    'audit:read',
    'user:read_own',
    'user:update_own',
    'dashboard:read',
    'dashboard:financial:read',
    'dashboard:orders:read',
    'dashboard:prescription:read',
    'dashboard:inventory:read',
    'dashboard:customer:read',
    'dashboard:analytics:read',
    'dashboard:refund:read',
  ],

  SUPER_ADMIN: [
    // Super Admin has all permissions including role & system governance
    'admin:access',
    'product:read',
    'product:create',
    'product:update',
    'product:archive',
    'inventory:read',
    'inventory:manage',
    'inventory:adjust',
    'batch:read',
    'batch:manage',
    'order:read_all',
    'order:update',
    'order:fulfill',
    'order:fulfillment',
    'payment:read_all',
    'payment:capture',
    'payment:refund',
    'prescription:upload',
    'prescription:read_own',
    'prescription:read_all',
    'prescription:review',
    'prescription:verify',
    'support:create',
    'support:read_own',
    'support:read_all',
    'support:update',
    'user:read_own',
    'user:update_own',
    'user:manage_all',
    'user:manage_role',
    'role:manage',
    'compliance:read',
    'compliance:manage',
    'compliance:rule_manage',
    'country_rule:manage',
    'audit:read',
    'security:manage',
    'dashboard:read',
    'dashboard:financial:read',
    'dashboard:orders:read',
    'dashboard:prescription:read',
    'dashboard:inventory:read',
    'dashboard:customer:read',
    'dashboard:analytics:read',
    'dashboard:refund:read',
  ],
};

/**
 * Validates whether a role possesses a requested permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
