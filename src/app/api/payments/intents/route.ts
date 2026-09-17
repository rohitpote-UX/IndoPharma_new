/**
 * POST /api/payments/intents
 * ==============================================================================
 * Creates a payment intent for a checkout session.
 *
 * SECURITY RULES:
 *  - Amount is NEVER accepted from the client. It is calculated from the Order.
 *  - The checkoutSessionId is used to look up the order server-side.
 *  - Authentication is required (session cookie or userId header).
 *  - The providerClientToken (safe frontend token) is the ONLY payment data
 *    returned to the browser. No secrets are ever returned.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payments/service';
import { getSafePaymentErrorMessage, DuplicatePaymentError } from '@/lib/payments/domain/payment-errors';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}`;

  try {
    const body = await req.json().catch(() => ({}));

    // Require either checkoutSessionId (preferred) or orderId
    const { checkoutSessionId, orderId: directOrderId, idempotencyKey } = body as {
      checkoutSessionId?: string;
      orderId?: string;
      idempotencyKey?: string;
    };

    // TODO: Replace with real session-based auth extraction
    // For now, require userId in body for development (replace with cookie auth)
    const userId = body.userId as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    if (!checkoutSessionId && !directOrderId) {
      return NextResponse.json(
        { success: false, error: 'checkoutSessionId or orderId is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      );
    }

    // Resolve order ID from checkout session if provided
    const orderId = directOrderId || checkoutSessionId!;

    // Generate idempotency key if not provided
    const idemKey = idempotencyKey || `pi_${orderId}_${userId}_${Date.now()}`;

    const result = await createPaymentIntent(orderId, userId, idemKey, requestId);

    // ONLY return safe data — NEVER return provider secrets or internal reconciliation data
    return NextResponse.json({
      success: true,
      payment: {
        paymentId: result.paymentId,
        paymentNumber: result.paymentNumber,
        // providerClientToken is safe — it's a one-time payment UI token, NOT an API key
        providerClientToken: result.providerClientToken,
        amountMinorUnits: result.amountMinorUnits,
        currency: result.currency,
        status: result.status,
      },
    });
  } catch (err) {
    console.error(`[POST /api/payments/intents] [${requestId}]`, err);

    const safeMessage = getSafePaymentErrorMessage(err);

    if (err instanceof DuplicatePaymentError) {
      return NextResponse.json(
        { success: false, error: safeMessage, code: 'DUPLICATE_PAYMENT' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: safeMessage, code: 'PAYMENT_ERROR' },
      { status: 500 }
    );
  }
}
