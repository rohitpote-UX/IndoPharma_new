/**
 * ==============================================================================
 * INDOPHARM — SERVER-SIDE AUTHORIZATION & IDOR DEFENSE GUARDS
 * ==============================================================================
 * Enforces server-side authorization boundaries, role permissions, and object-level
 * resource ownership verification to prevent Insecure Direct Object Reference (IDOR).
 * ==============================================================================
 */

import { NextRequest } from 'next/server';
import { authenticateRequest, SessionPayload } from '../session';
import { hasPermission, Permission } from './permissions';
import { UserRole } from '@prisma/client';

export class AuthorizationError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number = 403, code: string = 'FORBIDDEN') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Validates that an incoming request is authentically signed and unexpired.
 * Throws HTTP 401 if unauthenticated.
 */
export function requireAuth(req: NextRequest): SessionPayload {
  const session = authenticateRequest(req);
  if (!session) {
    throw new AuthorizationError('Authentication required. Please log in.', 401, 'UNAUTHENTICATED');
  }

  if (session.status === 'SUSPENDED') {
    throw new AuthorizationError('Your account has been suspended.', 403, 'ACCOUNT_SUSPENDED');
  }

  return session;
}

export { hasPermission };

/**
 * Validates that the authenticated session role possesses the required permission.
 * Throws HTTP 403 if unauthorized.
 */
export function requirePermission(session: SessionPayload, permission: Permission): void {
  if (!hasPermission(session.role, permission)) {
    throw new AuthorizationError(
      `Insufficient privileges. Required permission: ${permission}`,
      403,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

/**
 * Validates that the authenticated session role possesses at least one of the specified permissions.
 * Throws HTTP 403 if unauthorized.
 */
export function requireAnyPermission(session: SessionPayload, permissions: Permission[]): void {
  const allowed = permissions.some((p) => hasPermission(session.role, p));
  if (!allowed) {
    throw new AuthorizationError(
      `Insufficient privileges. Required one of: ${permissions.join(', ')}`,
      403,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

/**
 * IDOR Defense: Verifies that the caller owns the order OR has operational permission to read all orders.
 */
export function assertOrderAccess(
  session: SessionPayload,
  resourceOrUserId: string | { userId?: string; patientId?: string }
): boolean {
  const ownerId =
    typeof resourceOrUserId === 'string'
      ? resourceOrUserId
      : resourceOrUserId.userId || resourceOrUserId.patientId || '';

  // Owner match
  if (session.userId === ownerId) {
    return true;
  }

  // Staff with global order read permission
  if (hasPermission(session.role, 'order:read_all')) {
    return true;
  }

  throw new AuthorizationError('You do not have permission to view or modify this order.', 403, 'IDOR_REJECTED');
}

/**
 * IDOR Defense: Verifies that the caller owns the prescription OR is an authorized clinical reviewer.
 * Strictly adheres to healthcare least-privilege for ePHI.
 */
export function assertPrescriptionAccess(
  session: SessionPayload,
  resourceOrUserId: string | { userId?: string; patientId?: string }
): boolean {
  const ownerId =
    typeof resourceOrUserId === 'string'
      ? resourceOrUserId
      : resourceOrUserId.userId || resourceOrUserId.patientId || '';

  // Patient owner match
  if (session.userId === ownerId) {
    return true;
  }

  // Licensed clinical pharmacist or compliance reviewer
  if (
    hasPermission(session.role, 'prescription:verify') ||
    hasPermission(session.role, 'prescription:review')
  ) {
    return true;
  }

  throw new AuthorizationError('Access to prescription records is restricted to the patient and verified clinicians.', 403, 'IDOR_REJECTED');
}

/**
 * IDOR Defense: Verifies that the caller owns the support ticket OR has support desk authority.
 */
export function assertSupportTicketAccess(
  session: SessionPayload,
  resourceOrUserId: string | { userId?: string; customerId?: string }
): boolean {
  const ownerId =
    typeof resourceOrUserId === 'string'
      ? resourceOrUserId
      : resourceOrUserId.userId || resourceOrUserId.customerId || '';

  if (session.userId === ownerId) {
    return true;
  }

  if (hasPermission(session.role, 'support:read_all')) {
    return true;
  }

  throw new AuthorizationError('Access to this customer support ticket is forbidden.', 403, 'IDOR_REJECTED');
}

/**
 * Privilege Escalation Guard: Prevents unauthorized users from assigning elevated roles.
 */
export function assertRoleModificationAllowed(
  actor: SessionPayload,
  arg2: UserRole | string,
  arg3?: UserRole | string
): void {
  // Support both (actor, newRole, targetUserId?) and (actor, targetUserId, newRole)
  let targetUserId: string | undefined;
  let newRole: UserRole;

  if (typeof arg2 === 'string' && Object.values(UserRole).includes(arg2 as UserRole)) {
    newRole = arg2 as UserRole;
    targetUserId = typeof arg3 === 'string' ? arg3 : undefined;
  } else {
    targetUserId = arg2 as string;
    newRole = arg3 as UserRole;
  }

  // Users cannot modify their own role
  if (targetUserId && actor.userId === targetUserId) {
    throw new AuthorizationError('Users cannot modify their own administrative role.', 403, 'SELF_ROLE_CHANGE_FORBIDDEN');
  }

  // Only SUPER_ADMIN can grant or modify roles
  if (!hasPermission(actor.role, 'role:manage')) {
    throw new AuthorizationError('Only Super Administrators can modify user roles.', 403, 'ROLE_ESCALATION_FORBIDDEN');
  }

  // Only SUPER_ADMIN can create another SUPER_ADMIN
  if (newRole === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new AuthorizationError('Only a Super Administrator can assign the Super Administrator role.', 403, 'ROLE_ESCALATION_FORBIDDEN');
  }
}
