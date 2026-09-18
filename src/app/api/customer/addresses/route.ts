/**
 * /api/customer/addresses
 * ==============================================================================
 * Manages customer delivery addresses with ownership validation and CSRF protection.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { prisma } from '@/lib/db/client';
import { getOrCreateCustomer } from '@/lib/db/services/customerService';
import { AddressType } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve addresses.', code: err.code || 'ADDRESS_ERROR' },
      { status }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const session = requireAuth(req);
    const customer = await getOrCreateCustomer(session.userId);
    const body = await req.json().catch(() => ({}));

    const {
      recipientName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      type,
      isDefault,
    } = body;

    if (!recipientName || !addressLine1 || !city || !state || !postalCode || !country) {
      return NextResponse.json(
        { success: false, error: 'Missing required address fields.', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        // Reset previous defaults for this user
        await tx.address.updateMany({
          where: { userId: session.userId },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: {
          userId: session.userId,
          customerId: customer.id,
          line1: addressLine1.trim(),
          line2: addressLine2?.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          type: type === 'BILLING' ? AddressType.BILLING : AddressType.SHIPPING,
          isDefault: Boolean(isDefault),
        },
      });
    });

    return NextResponse.json({ success: true, address });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create address.', code: err.code || 'ADDRESS_ERROR' },
      { status }
    );
  }
}
