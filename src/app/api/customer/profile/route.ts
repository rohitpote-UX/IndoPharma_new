/**
 * /api/customer/profile
 * ==============================================================================
 * GET: Retrieves authenticated customer profile details.
 * PATCH: Updates permitted profile fields with strict mass assignment protection.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { prisma } from '@/lib/db/client';
import { getOrCreateCustomer } from '@/lib/db/services/customerService';
import { sanitizeString } from '@/lib/security/sanitize';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        customer: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        customer: user.customer
          ? {
              id: user.customer.id,
              customerType: user.customer.customerType,
              companyName: user.customer.companyName,
              isVerified: user.customer.isVerified,
            }
          : null,
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve profile.', code: err.code || 'PROFILE_ERROR' },
      { status }
    );
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const session = requireAuth(req);
    const body = await req.json().catch(() => ({}));

    // Explicit allowlist — Mass assignment defense
    const updateData: { firstName?: string; lastName?: string; phone?: string } = {};
    if (typeof body.firstName === 'string') updateData.firstName = sanitizeString(body.firstName.trim());
    if (typeof body.lastName === 'string') updateData.lastName = sanitizeString(body.lastName.trim());
    if (typeof body.phone === 'string') updateData.phone = sanitizeString(body.phone.trim());

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    if (typeof body.companyName === 'string') {
      const customer = await getOrCreateCustomer(session.userId);
      await prisma.customer.update({
        where: { id: customer.id },
        data: { companyName: sanitizeString(body.companyName.trim()) },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update profile.', code: err.code || 'PROFILE_UPDATE_ERROR' },
      { status }
    );
  }
}
