/**
 * ==============================================================================
 * INDOPHARM — USER AUTHENTICATION & IDENTITY SERVICE
 * ==============================================================================
 * Production authentication service coordinating credentials, scrypt hashing,
 * account status enforcement, MFA evaluation, and audit logging.
 * ==============================================================================
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db/client';
import { hashPassword, verifyPassword, validatePasswordPolicy } from './password';
import { createSessionToken, revokeSession, SessionPayload, PRIVILEGED_SESSION_DURATION_SECONDS } from './session';
import { verifyTotp } from './mfa';
import { logAuditEvent } from '@/lib/security/audit';
import { UserRole, UserStatus, CustomerType } from '@prisma/client';

export class AuthenticationError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
  }
}

export interface LoginResult {
  success: boolean;
  requiresMfa?: boolean;
  sessionToken?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
  };
}

const PRIVILEGED_ROLES: UserRole[] = [
  'ADMIN',
  'SUPER_ADMIN',
  'CLINICAL_PHARMACIST',
  'OPS_WAREHOUSE',
  'COMPLIANCE_ADMIN',
];

/**
 * Authenticates a user with email and password.
 */
export async function loginUser(
  email: string,
  passwordPlain: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { customer: true, admin: true },
  });

  if (!user || !user.passwordHash) {
    // Record audit event for suspicious/failed login attempt
    await logAuditEvent({
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: 'unknown',
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { email: normalizedEmail, result: 'FAILED', reason: 'USER_NOT_FOUND' },
    });
    throw new AuthenticationError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // Account status guard (Golden Rule: Suspended users immediately denied)
  if (user.status === 'SUSPENDED') {
    await logAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { result: 'DENIED', reason: 'ACCOUNT_SUSPENDED' },
    });
    throw new AuthenticationError('Account has been suspended. Please contact compliance support.', 'ACCOUNT_SUSPENDED');
  }

  if (user.status === 'INACTIVE') {
    throw new AuthenticationError('Account is inactive.', 'ACCOUNT_INACTIVE');
  }

  // Verify scrypt hash with timingSafeEqual
  const passwordValid = await verifyPassword(passwordPlain, user.passwordHash);
  if (!passwordValid) {
    await logAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      metadata: { result: 'FAILED', reason: 'INVALID_PASSWORD' },
    });
    throw new AuthenticationError('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // Mandatory MFA check for privileged roles or accounts with MFA enabled
  const isPrivileged = PRIVILEGED_ROLES.includes(user.role);
  if (user.twoFactorEnabled || isPrivileged) {
    // Return intermediate state requiring TOTP submission
    const tempToken = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      mfaVerified: false,
      expiresInSeconds: 300, // 5-minute window to enter TOTP
    });

    return {
      success: true,
      requiresMfa: true,
      sessionToken: tempToken,
    };
  }

  // Normal login success: update lastLoginAt and issue full session token
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const sessionDuration = isPrivileged
    ? PRIVILEGED_SESSION_DURATION_SECONDS
    : undefined;

  const sessionToken = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    mfaVerified: true,
    expiresInSeconds: sessionDuration,
  });

  await logAuditEvent({
    userId: user.id,
    userRole: user.role,
    action: 'USER_LOGIN',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    metadata: { result: 'SUCCESS' },
  });

  return {
    success: true,
    requiresMfa: false,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  };
}

/**
 * Registers a new Customer account with strict password validation.
 */
export async function registerCustomer(input: {
  email: string;
  passwordPlain: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  customerType?: CustomerType;
}): Promise<{ sessionToken: string; userId: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  // Validate password policy
  const policy = validatePasswordPolicy(input.passwordPlain);
  if (!policy.valid) {
    throw new AuthenticationError(policy.errors.join(' '), 'WEAK_PASSWORD');
  }

  // Check duplicate email
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new AuthenticationError('An account with this email address already exists.', 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(input.passwordPlain);

  // Transactionally create User and Customer business profile
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone?.trim(),
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      },
    });

    await tx.customer.create({
      data: {
        userId: user.id,
        companyName: input.companyName?.trim(),
        customerType: input.customerType ?? CustomerType.INDIVIDUAL,
      },
    });

    return user;
  });

  const sessionToken = createSessionToken({
    userId: result.id,
    email: result.email,
    role: result.role,
    status: result.status,
    mfaVerified: true,
  });

  await logAuditEvent({
    userId: result.id,
    userRole: result.role,
    action: 'USER_LOGIN',
    resourceType: 'User',
    resourceId: result.id,
    metadata: { action: 'USER_REGISTERED' },
  });

  return { sessionToken, userId: result.id };
}

/**
 * Invalidate a session server-side on logout.
 */
export async function logoutUser(session: SessionPayload): Promise<void> {
  revokeSession(session.sessionId);

  await logAuditEvent({
    userId: session.userId,
    userRole: session.role,
    action: 'USER_LOGOUT',
    resourceType: 'User',
    resourceId: session.userId,
    metadata: { sessionId: session.sessionId },
  });
}

// In-memory single-use registry for password reset tokens
const USED_RESET_TOKENS = new Set<string>();

function getResetSecret(): string {
  return process.env.RESET_SECRET || process.env.SESSION_SECRET || 'dev_reset_secret_key_32_bytes_long!!';
}

/**
 * Requests a password reset token.
 * Follows enumeration-resistant design (neutral response regardless of user existence).
 */
export async function requestPasswordReset(
  email: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const neutralMessage = 'If an account exists with that email address, password reset instructions have been sent.';

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash || user.status === 'SUSPENDED') {
    // Neutral response prevents account enumeration attacks
    return { success: true, message: neutralMessage };
  }

  // Token expires in 15 minutes
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const randomEntropy = crypto.randomBytes(16).toString('hex');
  const payloadToSign = `${user.id}:${expiresAt}:${randomEntropy}:${user.passwordHash}`;
  const signature = crypto
    .createHmac('sha256', getResetSecret())
    .update(payloadToSign)
    .digest('hex');

  const resetToken = `${user.id}.${expiresAt}.${randomEntropy}.${signature}`;

  await logAuditEvent({
    userId: user.id,
    userRole: user.role,
    action: 'PASSWORD_RESET_REQUESTED',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return {
    success: true,
    message: neutralMessage,
    // Provide resetToken in non-production for automated testing / integration
    resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
  };
}

/**
 * Completes a password reset using a signed single-use token.
 */
export async function completePasswordReset(
  token: string,
  newPasswordPlain: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string }> {
  if (!token || typeof token !== 'string') {
    throw new AuthenticationError('Invalid password reset token.', 'INVALID_TOKEN');
  }

  if (USED_RESET_TOKENS.has(token)) {
    throw new AuthenticationError('Password reset token has already been used.', 'TOKEN_ALREADY_USED');
  }

  const parts = token.split('.');
  if (parts.length !== 4) {
    throw new AuthenticationError('Invalid token format.', 'INVALID_TOKEN');
  }

  const [userId, expiresAtStr, randomEntropy, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    throw new AuthenticationError('Password reset token has expired.', 'TOKEN_EXPIRED');
  }

  // Retrieve user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Invalid password reset token.', 'INVALID_TOKEN');
  }

  // Verify HMAC signature
  const payloadToSign = `${user.id}:${expiresAt}:${randomEntropy}:${user.passwordHash}`;
  const expectedSignature = crypto
    .createHmac('sha256', getResetSecret())
    .update(payloadToSign)
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new AuthenticationError('Invalid or tampered password reset token.', 'INVALID_TOKEN');
  }

  // Enforce enterprise password policy
  const policy = validatePasswordPolicy(newPasswordPlain);
  if (!policy.valid) {
    throw new AuthenticationError(policy.errors.join(' '), 'WEAK_PASSWORD');
  }

  // Hash new password using scrypt
  const newHash = await hashPassword(newPasswordPlain);

  // Transactionally update password and mark token used
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  USED_RESET_TOKENS.add(token);

  await logAuditEvent({
    userId: user.id,
    userRole: user.role,
    action: 'PASSWORD_RESET_COMPLETED',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return { success: true, message: 'Password has been successfully updated.' };
}

