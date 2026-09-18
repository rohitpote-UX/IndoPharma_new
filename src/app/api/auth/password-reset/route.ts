/**
 * POST /api/auth/password-reset
 * ==============================================================================
 * Handles secure, enumeration-resistant password reset requests and completion.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset, completePasswordReset } from '@/lib/auth/service';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrfOrigin } from '@/lib/security/csrf';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 1. Sliding-Window Rate Limit: 5 requests per 15 minutes per IP
  const rateLimit = checkRateLimit(`pwd_reset_${ip}`, { maxRequests: 5, windowSeconds: 900 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many password reset requests. Please try again later.', code: 'RATE_LIMITED' },
      { status: 429 }
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
    const { email, token, newPassword } = body;

    // Mode A: Complete password reset with token and new password
    if (token && newPassword) {
      const result = await completePasswordReset(token, newPassword, { ipAddress: ip, userAgent });
      return NextResponse.json(result);
    }

    // Mode B: Initiate password reset request
    if (email) {
      const result = await requestPasswordReset(email, { ipAddress: ip, userAgent });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Either email (to request) or token & newPassword (to reset) is required.', code: 'MISSING_FIELDS' },
      { status: 400 }
    );
  } catch (err: any) {
    const status = err.code === 'TOKEN_EXPIRED' || err.code === 'INVALID_TOKEN' || err.code === 'TOKEN_ALREADY_USED' ? 400 : 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Password reset failed.', code: err.code || 'RESET_FAILED' },
      { status }
    );
  }
}
