/**
 * POST /api/payments/[paymentId]/capture
 * ==============================================================================
 * Captures an authorized payment.
 *
 * AUTHORIZATION: Only COMPLIANCE_ADMIN or OPS_WAREHOUSE roles may initiate capture.
 * Patients CANNOT trigger capture — this is a server-controlled backend operation
 * that happens after pharmacist prescription verification and warehouse dispatch.
 *
 * IDEMPOTENCY: Duplicate capture requests with the same idempotency key return
 * the same result without triggering a second capture.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { capturePayment } from '@/lib/payments/service';
import {
  getSafePaymentErrorMessage,
  PaymentNotFoundError,
  PaymentNotCapturableError,
  PaymentAuthorizationError,
} from '@/lib/payments/domain/payment-errors';

const CAPTURE_AUTHORIZED_ROLES = ['COMPLIANCE_ADMIN', 'OPS_WAREHOUSE'] as const;

interface Params {
  params: Promise<{ paymentId: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;

  try {
    const { paymentId } = await params;

    // Auth: only staff with capture authority
    const userId = req.headers.get('x-user-id') || '';
    const userRole = req.headers.get('x-user-role') || '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    if (!CAPTURE_AUTHORIZED_ROLES.includes(userRole as typeof CAPTURE_AUTHORIZED_ROLES[number])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to capture payment', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const idempotencyKey = (body.idempotencyKey as string) || `cap_${paymentId}_${Date.now()}`;

    const result = await capturePayment(paymentId, userId, userRole, idempotencyKey, requestId);

    return NextResponse.json({
      success: true,
      capture: {
        paymentId: result.paymentId,
        capturedAmountMinorUnits: result.capturedAmountMinorUnits,
        currency: result.currency,
        status: result.status,
        capturedAt: result.capturedAt,
      },
    });
  } catch (err) {
    console.error(`[POST /api/payments/:paymentId/capture] [${requestId}]`, err);

    const safeMessage = getSafePaymentErrorMessage(err);

    if (err instanceof PaymentNotFoundError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (err instanceof PaymentNotCapturableError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'NOT_CAPTURABLE' },
        { status: 409 }
      );
    }

    if (err instanceof PaymentAuthorizationError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: safeMessage, code: 'PAYMENT_ERROR' },
      { status: 500 }
    );
  }
}
