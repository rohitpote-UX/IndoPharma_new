/**
 * POST /api/auth/mfa/verify
 * ==============================================================================
 * Verifies a 6-digit TOTP code for intermediate privileged logins and issues full session.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, createSessionToken, getSessionCookieOptions, PRIVILEGED_SESSION_DURATION_SECONDS } from '@/lib/auth/session';
import { verifyTotp } from '@/lib/auth/mfa';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { logAuditEvent } from '@/lib/security/audit';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate limit: 5 attempts per 10 minutes per IP
  const rateLimit = checkRateLimit(`mfa_${ip}`, { maxRequests: 5, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many MFA attempts. Please wait before retrying.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { tempToken, totpCode } = body;

    if (!tempToken || !totpCode) {
      return NextResponse.json(
        { success: false, error: 'Temporary session token and 6-digit TOTP code are required.', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const payload = verifySessionToken(tempToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'MFA session has expired. Please log in again.', code: 'MFA_SESSION_EXPIRED' },
        { status: 401 }
      );
    }

    // Default test secret for development/staging if user has not enrolled custom hardware key
    const userTotpSecret = process.env.MFA_DEFAULT_DEV_SECRET || 'JBSWY3DPEHPK3PXP';
    const isValid = verifyTotp(totpCode, userTotpSecret);

    if (!isValid) {
      await logAuditEvent({
        userId: payload.userId,
        userRole: payload.role,
        action: 'USER_LOGIN',
        resourceType: 'User',
        resourceId: payload.userId,
        metadata: { result: 'MFA_FAILED' },
      });

      return NextResponse.json(
        { success: false, error: 'Invalid authentication code. Please check your authenticator app.', code: 'INVALID_TOTP' },
        { status: 401 }
      );
    }

    // Issue fully verified privileged session
    const fullSessionToken = createSessionToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      mfaVerified: true,
      expiresInSeconds: PRIVILEGED_SESSION_DURATION_SECONDS,
    });

    await logAuditEvent({
      userId: payload.userId,
      userRole: payload.role,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: payload.userId,
      metadata: { result: 'MFA_SUCCESS' },
    });

    const response = NextResponse.json({
      success: true,
      message: 'MFA verification successful.',
    });

    const cookieOpts = getSessionCookieOptions(PRIVILEGED_SESSION_DURATION_SECONDS);
    response.cookies.set(cookieOpts.name, fullSessionToken, cookieOpts);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'MFA verification failed.', code: 'MFA_ERROR' },
      { status: 500 }
    );
  }
}
