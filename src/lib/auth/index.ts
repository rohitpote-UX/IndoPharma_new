/**
 * ==============================================================================
 * INDOPHARM — AUTH & RBAC HELPERS
 * ==============================================================================
 */

import { UserRole } from '@/types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Validates that a user role meets the required role permission tier.
 */
export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export const STAFF_ROLES: UserRole[] = [
  'CLINICAL_PHARMACIST',
  'OPS_WAREHOUSE',
  'COMPLIANCE_ADMIN',
];
