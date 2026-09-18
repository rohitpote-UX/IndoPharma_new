/**
 * POST /api/auth/login
 * ==============================================================================
 * Authenticates user credentials with rate limiting and secure HttpOnly cookie issuance.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/service';
import { getSessionCookieOptions } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrfOrigin } from '@/lib/security/csrf';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 1. Sliding-Window Rate Limit: 5 attempts per 15 minutes per IP
  const rateLimit = checkRateLimit(`login_${ip}`, { maxRequests: 5, windowSeconds: 900 });
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED',
      },
      {
        status: 429,
        headers: { 'Retry-After': retryAfterSeconds.toString() },
      }
    );
  }

  // 2. CSRF Origin Validation
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password, { ipAddress: ip, userAgent });

    const response = NextResponse.json({
      success: true,
      requiresMfa: result.requiresMfa,
      user: result.user,
    });

    // If fully authenticated without MFA, set HttpOnly session cookie
    if (result.sessionToken && !result.requiresMfa) {
      const cookieOpts = getSessionCookieOptions();
      response.cookies.set(cookieOpts.name, result.sessionToken, cookieOpts);
    }

    return response;
  } catch (err: any) {
    const status = err.code === 'ACCOUNT_SUSPENDED' ? 403 : 401;
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication failed', code: err.code || 'AUTH_FAILED' },
      { status }
    );
  }
}
