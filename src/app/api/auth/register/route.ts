/**
 * POST /api/auth/register
 * ==============================================================================
 * Customer registration endpoint with input validation, rate limiting, and scrypt hashing.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/auth/service';
import { getSessionCookieOptions } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrfOrigin } from '@/lib/security/csrf';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate limit: 10 registrations per hour per IP
  const rateLimit = checkRateLimit(`reg_${ip}`, { maxRequests: 10, windowSeconds: 3600 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many registration requests. Please try again later.', code: 'RATE_LIMITED' },
      { status: 429 }
    );
  }

  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, firstName, lastName, phone, companyName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, first name, and last name are required.', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const { sessionToken, userId } = await registerCustomer({
      email,
      passwordPlain: password,
      firstName,
      lastName,
      phone,
      companyName,
    });

    const response = NextResponse.json({
      success: true,
      userId,
      message: 'Account registered successfully.',
    });

    // Set session cookie
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, sessionToken, cookieOpts);

    return response;
  } catch (err: any) {
    const status = err.code === 'EMAIL_EXISTS' ? 409 : 400;
    return NextResponse.json(
      { success: false, error: err.message || 'Registration failed.', code: err.code || 'REGISTRATION_ERROR' },
      { status }
    );
  }
}
