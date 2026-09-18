/**
 * POST /api/auth/logout
 * ==============================================================================
 * Terminates user session, revokes session ID server-side, and clears cookie.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { logoutUser } from '@/lib/auth/service';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = authenticateRequest(req);

  if (session) {
    await logoutUser(session);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });

  // Clear session cookie
  const cookieOpts = getSessionCookieOptions(0);
  response.cookies.set(SESSION_COOKIE_NAME, '', { ...cookieOpts, maxAge: 0 });

  return response;
}
