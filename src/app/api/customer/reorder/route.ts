/**
 * /api/customer/reorder
 * ==============================================================================
 * GET: Retrieves previously ordered medicines with live price deltas and stock.
 * POST: Validates and prepares reorder with idempotency and safety gates.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { getCustomerReorderItems, validateAndExecuteReorder } from '@/lib/services/reorderService';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const reorderItems = await getCustomerReorderItems(session.userId);
    return NextResponse.json({ success: true, reorderItems });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve reorder items.', code: err.code || 'REORDER_ERROR' },
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
    const body = await req.json().catch(() => ({}));
    const { productId, quantity, idempotencyKey } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required for reorder.', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }

    const result = await validateAndExecuteReorder(session.userId, {
      productId,
      quantity,
      idempotencyKey,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Reorder failed.', code: err.code || 'REORDER_FAILED' },
      { status }
    );
  }
}
