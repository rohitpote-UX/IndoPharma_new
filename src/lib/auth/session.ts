/**
 * ==============================================================================
 * INDOPHARM — CRYPTOGRAPHIC SESSION & TOKEN MANAGEMENT
 * ==============================================================================
 * Issues and validates tamper-evident HMAC-SHA256 signed session tokens.
 * Configures HttpOnly, Secure, SameSite=Lax cookie options.
 * Supports server-side session revocation for account logout & suspension.
 * ==============================================================================
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { UserRole, UserStatus } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'indopharm_session';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days for normal users
export const PRIVILEGED_SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours for staff/admin

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  sessionId: string;
  mfaVerified?: boolean;
  iat: number;
  exp: number;
}

// In-memory revocation registry for server lifecycle (blacklisted sessionIds)
const REVOKED_SESSIONS = new Set<string>();

function getSecretKey(): string {
  return process.env.SESSION_SECRET || 'dev_secret_change_in_production_min_32_chars_long!';
}

function base64UrlEncode(data: string | Buffer): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates a signed, tamper-evident session token.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp' | 'sessionId'> & {
  sessionId?: string;
  expiresInSeconds?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const duration = payload.expiresInSeconds ?? SESSION_DURATION_SECONDS;
  const sessionId = payload.sessionId || `sess_${crypto.randomBytes(16).toString('hex')}`;

  const fullPayload: SessionPayload = {
    ...payload,
    sessionId,
    iat: now,
    exp: now + duration,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a signed session token. Returns null if expired, tampered, or revoked.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();

    const actualSignature = Buffer.from(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );

    if (
      expectedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    // Check revocation
    if (REVOKED_SESSIONS.has(payload.sessionId)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Revokes an active session ID server-side.
 */
export function revokeSession(sessionId: string): void {
  REVOKED_SESSIONS.add(sessionId);
}

/**
 * Returns security-hardened cookie attributes.
 */
export function getSessionCookieOptions(maxAgeSeconds: number = SESSION_DURATION_SECONDS) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Extracts and verifies the authenticated caller session from a NextRequest.
 * Checks HttpOnly session cookie first, then Bearer Authorization header.
 * NEVER trusts client-injected x-user-id headers.
 */
export function authenticateRequest(req: NextRequest): SessionPayload | null {
  // 1. Check HttpOnly cookie
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) return session;
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const session = verifySessionToken(bearerToken);
    if (session) return session;
  }

  return null;
}
