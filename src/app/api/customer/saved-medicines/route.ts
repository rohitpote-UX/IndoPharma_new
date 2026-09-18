/**
 * /api/customer/saved-medicines
 * ==============================================================================
 * GET: Retrieves saved medicines for authenticated customer.
 * POST: Toggles saved state of a medicine.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { getOrCreateCustomer } from '@/lib/db/services/customerService';
import { getCustomerSavedMedicines, toggleSavedMedicine } from '@/lib/services/savedMedicineService';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const customer = await getOrCreateCustomer(session.userId);
    const saved = await getCustomerSavedMedicines(customer.id);
    return NextResponse.json({ success: true, savedMedicines: saved });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve saved medicines.', code: err.code || 'SAVED_MEDICINE_ERROR' },
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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required.', code: 'MISSING_PRODUCT_ID' },
        { status: 400 }
      );
    }

    const customer = await getOrCreateCustomer(session.userId);
    const result = await toggleSavedMedicine(customer.id, productId);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update saved medicine.', code: err.code || 'SAVED_MEDICINE_ERROR' },
      { status }
    );
  }
}
