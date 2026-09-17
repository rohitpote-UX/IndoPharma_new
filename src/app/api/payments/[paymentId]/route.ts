/**
 * GET /api/payments/[paymentId]
 * ==============================================================================
 * Returns safe payment status information.
 * Authorization: payment owner OR staff role.
 *
 * SECURITY: Never returns provider secrets, raw credentials, or internal
 * reconciliation data.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/payments/service';
import { getSafePaymentErrorMessage, PaymentNotFoundError, PaymentAuthorizationError } from '@/lib/payments/domain/payment-errors';

interface Params {
  params: Promise<{ paymentId: string }>;
}

export async function GET(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;

  try {
    const { paymentId } = await params;

    // TODO: Replace with real session-based auth
    const userId = req.headers.get('x-user-id') || '';
    const userRole = req.headers.get('x-user-role') || 'PATIENT';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const status = await getPaymentStatus(paymentId, userId, userRole);

    return NextResponse.json({
      success: true,
      payment: {
        paymentId: status.paymentId,
        paymentNumber: status.paymentNumber,
        orderId: status.orderId,
        status: status.status,
        amountMinorUnits: status.amountMinorUnits,
        capturedMinorUnits: status.capturedMinorUnits,
        refundedMinorUnits: status.refundedMinorUnits,
        currency: status.currency,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      },
    });
  } catch (err) {
    console.error(`[GET /api/payments/:paymentId] [${requestId}]`, err);

    if (err instanceof PaymentNotFoundError) {
      return NextResponse.json(
        { success: false, error: getSafePaymentErrorMessage(err), code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (err instanceof PaymentAuthorizationError) {
      return NextResponse.json(
        { success: false, error: getSafePaymentErrorMessage(err), code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: getSafePaymentErrorMessage(err), code: 'PAYMENT_ERROR' },
      { status: 500 }
    );
  }
}
