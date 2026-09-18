/**
 * GET /api/auth/session
 * ==============================================================================
 * Returns the sanitized authentication session profile of the caller.
 * Never exposes passwords, password hashes, or sensitive credentials.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/session';
import { ROLE_PERMISSIONS } from '@/lib/auth/rbac/permissions';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = authenticateRequest(req);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      status: session.status,
      mfaVerified: session.mfaVerified,
      permissions: ROLE_PERMISSIONS[session.role] || [],
    },
  });
}
