/**
 * POST /api/prescriptions/[id]/review
 * ==============================================================================
 * Clinical Pharmacist prescription review endpoint.
 * Restricted to licensed pharmacists and compliance staff.
 * Validates CSRF, evaluates state machine transition, and records audit trail.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { validateCsrfOrigin } from '@/lib/security/csrf';
import { reviewPrescription } from '@/lib/services/prescriptionService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  if (!validateCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Cross-origin request rejected.', code: 'CSRF_REJECTED' },
      { status: 403 }
    );
  }

  try {
    const session = requireAuth(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const { action, rejectionReasonCode, customerMessage, internalNotes, expiresAt, refillsAuthorized } = body;

    if (!action || !['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid review action (APPROVE, REJECT, REQUEST_MORE_INFO) is required.', code: 'INVALID_ACTION' },
        { status: 400 }
      );
    }

    const updated = await reviewPrescription(
      id,
      {
        action,
        rejectionReasonCode,
        customerMessage,
        internalNotes,
        expiresAt,
        refillsAuthorized,
      },
      session,
      { ipAddress: ip, userAgent }
    );

    return NextResponse.json({
      success: true,
      prescription: {
        id: updated.id,
        status: updated.status,
        rejectionReasonCode: updated.rejectionReasonCode,
        customerMessage: updated.customerMessage,
        verifiedAt: updated.verifiedAt,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'UNAUTHORIZED_REVIEWER' ? 403 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Prescription review failed.', code: err.code || 'REVIEW_FAILED' },
      { status }
    );
  }
}
