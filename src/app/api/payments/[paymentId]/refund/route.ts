/**
 * POST /api/payments/[paymentId]/refund
 * ==============================================================================
 * Initiates a full or partial refund.
 *
 * AUTHORIZATION: Only authenticated staff roles may initiate refunds.
 * AMOUNT VALIDATION: Server enforces that totalRefunded ≤ capturedAmount.
 * IDEMPOTENCY: Duplicate requests with same idempotency key return same result.
 *
 * Accepted reasons (must match RefundReason business vocabulary):
 *  - PRESCRIPTION_REJECTED
 *  - CUSTOMER_CANCELLATION
 *  - CUSTOMS_NON_DELIVERY
 *  - SUSPECTED_FRAUD
 *  - ADMIN_DISCRETION
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { processRefund } from '@/lib/payments/service';
import {
  getSafePaymentErrorMessage,
  PaymentNotFoundError,
  PaymentStateError,
  RefundExceedsCapturableError,
  PaymentAuthorizationError,
} from '@/lib/payments/domain/payment-errors';

const REFUND_AUTHORIZED_ROLES = [
  'COMPLIANCE_ADMIN',
  'OPS_WAREHOUSE',
  'SUPPORT_AGENT',
  'CLINICAL_PHARMACIST',
] as const;

const VALID_REFUND_REASONS = [
  'PRESCRIPTION_REJECTED',
  'CUSTOMER_CANCELLATION',
  'CUSTOMS_NON_DELIVERY',
  'SUSPECTED_FRAUD',
  'ADMIN_DISCRETION',
] as const;

interface Params {
  params: Promise<{ paymentId: string }>;
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;

  try {
    const { paymentId } = await params;

    const userId = req.headers.get('x-user-id') || '';
    const userRole = req.headers.get('x-user-role') || '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    if (!REFUND_AUTHORIZED_ROLES.includes(userRole as typeof REFUND_AUTHORIZED_ROLES[number])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to process refund', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const { reason, notes, idempotencyKey, amountMinorUnits } = body as {
      reason?: string;
      notes?: string;
      idempotencyKey?: string;
      amountMinorUnits?: number; // Optional — null/undefined = full refund
    };

    // Validate reason
    if (!reason || !VALID_REFUND_REASONS.includes(reason as typeof VALID_REFUND_REASONS[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid refund reason. Must be one of: ${VALID_REFUND_REASONS.join(', ')}`,
          code: 'INVALID_REASON',
        },
        { status: 400 }
      );
    }

    // Validate amount if provided (must be positive integer)
    if (amountMinorUnits !== undefined && amountMinorUnits !== null) {
      if (!Number.isInteger(amountMinorUnits) || amountMinorUnits <= 0) {
        return NextResponse.json(
          { success: false, error: 'amountMinorUnits must be a positive integer', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
    }

    const idemKey = idempotencyKey || `ref_${paymentId}_${userId}_${Date.now()}`;

    const result = await processRefund(
      paymentId,
      amountMinorUnits ?? null,
      reason,
      notes,
      userId,
      userRole,
      idemKey,
      requestId
    );

    return NextResponse.json({
      success: true,
      refund: {
        refundId: result.refundId,
        refundNumber: result.refundNumber,
        paymentId: result.paymentId,
        amountMinorUnits: result.amountMinorUnits,
        currency: result.currency,
        status: result.status,
      },
    });
  } catch (err) {
    console.error(`[POST /api/payments/:paymentId/refund] [${requestId}]`, err);

    const safeMessage = getSafePaymentErrorMessage(err);

    if (err instanceof PaymentNotFoundError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (err instanceof RefundExceedsCapturableError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'REFUND_EXCEEDS_CAPTURABLE' },
        { status: 422 }
      );
    }

    if (err instanceof PaymentStateError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'INVALID_STATE' },
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
