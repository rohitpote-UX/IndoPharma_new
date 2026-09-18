/**
 * GET /api/prescriptions
 * ==============================================================================
 * Retrieves prescriptions according to caller role:
 *  - Patients: Returns paginated list of their own submitted prescriptions.
 *  - Clinical Pharmacists / Compliance Admins: Returns active review queue.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { getCustomerPrescriptions, getPrescriptionReviewQueue } from '@/lib/services/prescriptionService';
import { PrescriptionStatus } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const statusParam = searchParams.get('status') as PrescriptionStatus | null;

    // Route based on role
    if (session.role === 'PATIENT') {
      const result = await getCustomerPrescriptions(session.userId, { page, limit });
      return NextResponse.json({ success: true, ...result });
    }

    if (
      session.role === 'CLINICAL_PHARMACIST' ||
      session.role === 'COMPLIANCE_ADMIN' ||
      session.role === 'SUPER_ADMIN'
    ) {
      const result = await getPrescriptionReviewQueue(session, {
        status: statusParam || undefined,
        page,
        limit,
      });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json(
      { success: false, error: 'Access to prescription records is restricted.', code: 'FORBIDDEN' },
      { status: 403 }
    );
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 403);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve prescriptions.', code: err.code || 'PRESCRIPTION_ERROR' },
      { status }
    );
  }
}
