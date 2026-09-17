/**
 * ==============================================================================
 * INDOPHARM — PAYMENT SERVICE
 * ==============================================================================
 * The single authoritative orchestrator for all payment lifecycle operations.
 *
 * This service is the ONLY module that coordinates between:
 *  - The payment domain (state machine, money, errors)
 *  - The payment adapter (provider-specific implementation)
 *  - The database (Prisma — Payment, PaymentAttempt, Refund, etc.)
 *  - The order system (OrderStatus transitions)
 *
 * Architecture rule:
 *   Checkout → PaymentService → PaymentAdapter → Provider
 *   NEVER: Checkout → PaymentAdapter directly
 *   NEVER: Frontend → Provider SDK directly
 *
 * Security rule:
 *   Payment amount is ALWAYS retrieved from the database via orderId.
 *   Client-provided amounts are NEVER trusted or used.
 *
 * Idempotency rule:
 *   All money-moving operations use idempotency keys.
 *   The service checks for an existing completed operation before proceeding.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { getPaymentAdapter } from './provider';
import {
  isValidTransition,
  REFUNDABLE_STATUSES,
  CAPTURABLE_STATUSES,
  type InternalPaymentStatus,
} from './domain/payment-status';
import { toMinorUnits, fromMinorUnits } from './domain/money';
import {
  PaymentNotFoundError,
  PaymentStateError,
  DuplicatePaymentError,
  AmountMismatchError,
  RefundExceedsCapturableError,
  PaymentAuthorizationError,
  PaymentNotCapturableError,
  CurrencyMismatchError,
  getSafePaymentErrorMessage,
} from './domain/payment-errors';
import {
  eventTypeToStatus,
  type NormalizedPaymentEvent,
} from './domain/payment-events';
import { logPaymentAuditEvent } from './audit';

// ---------------------------------------------------------------------------
// Public Service API Types
// ---------------------------------------------------------------------------

export interface CreatePaymentIntentResult {
  paymentId: string;
  paymentNumber: string;
  /** Client token for frontend payment UI — safe to send to browser */
  providerClientToken: string | null;
  amountMinorUnits: number;
  currency: string;
  status: InternalPaymentStatus;
}

export interface CapturePaymentResult {
  paymentId: string;
  capturedAmountMinorUnits: number;
  currency: string;
  status: InternalPaymentStatus;
  capturedAt: Date;
}

export interface ProcessRefundResult {
  refundId: string;
  refundNumber: string;
  paymentId: string;
  amountMinorUnits: number;
  currency: string;
  status: string;
}

export interface PaymentStatusResult {
  paymentId: string;
  paymentNumber: string;
  orderId: string;
  status: InternalPaymentStatus;
  amountMinorUnits: number;
  capturedMinorUnits: number;
  refundedMinorUnits: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helper: Generate sequential identifiers
// ---------------------------------------------------------------------------

function generatePaymentNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${ts}-${rand}`;
}

function generateRefundNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `REF-${ts}-${rand}`;
}

// ---------------------------------------------------------------------------
// CREATE PAYMENT INTENT
// ---------------------------------------------------------------------------

/**
 * Creates a new Payment record and initiates a payment intent with the provider.
 *
 * SECURITY: Amount is retrieved from the Order record in the database.
 * The client-provided amount (if any) is IGNORED.
 *
 * IDEMPOTENCY: If a non-failed Payment already exists for this orderId,
 * returns it without creating a duplicate.
 */
export async function createPaymentIntent(
  orderId: string,
  userId: string,
  idempotencyKey: string,
  requestId?: string
): Promise<CreatePaymentIntentResult> {
  // 1. Check for existing payment (idempotency)
  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (existing && existing.status !== 'FAILED' && existing.status !== 'CANCELLED') {
    return {
      paymentId: existing.id,
      paymentNumber: existing.paymentNumber,
      providerClientToken: existing.providerClientToken,
      amountMinorUnits: existing.amountMinorUnits,
      currency: existing.currency,
      status: existing.status as InternalPaymentStatus,
    };
  }

  // 2. Fetch and validate the order (server-side amount authority)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    throw new PaymentNotFoundError(`Order not found: ${orderId}`);
  }

  // 3. Verify ownership
  if (order.userId !== userId) {
    throw new PaymentAuthorizationError('You do not own this order');
  }

  // 4. Calculate authoritative amount from order record (NEVER from client)
  const currency = 'USD';
  const amountMinorUnits = toMinorUnits(order.totalUsd.toString(), currency);

  if (amountMinorUnits <= 0) {
    throw new Error(`[PaymentService] Invalid order amount: ${order.totalUsd}`);
  }

  // 5. Resolve the active provider adapter
  const adapter = getPaymentAdapter();

  // 6. Create payment record in DB (CREATED status)
  const paymentNumber = generatePaymentNumber();
  const payment = await prisma.payment.create({
    data: {
      paymentNumber,
      orderId,
      userId,
      providerId: adapter.providerId,
      status: 'CREATED',
      amountMinorUnits,
      currency,
      captureMode: process.env.PAYMENT_CAPTURE_MODE || 'manual',
      idempotencyKey,
      expiresAt: new Date(
        Date.now() + parseInt(process.env.PAYMENT_INTENT_EXPIRY_SECONDS || '1800', 10) * 1000
      ),
    },
  });

  // 7. Call provider adapter
  let providerResponse;
  const attemptStart = Date.now();

  try {
    providerResponse = await adapter.createPaymentIntent({
      orderId,
      customerId: userId,
      amountMinorUnits,
      currency,
      idempotencyKey,
      captureMode: (process.env.PAYMENT_CAPTURE_MODE || 'manual') as 'manual' | 'automatic',
      metadata: { orderId, paymentNumber, providerId: adapter.providerId },
    });
  } catch (err) {
    // Network failure or provider error — set to UNKNOWN, not FAILED
    // Let reconciliation determine true state
    const durationMs = Date.now() - attemptStart;
    await prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        attemptNumber: 1,
        providerId: adapter.providerId,
        operation: 'CREATE_INTENT',
        status: 'UNKNOWN',
        requestedAmountMinorUnits: amountMinorUnits,
        currency,
        durationMs,
        errorMessage: err instanceof Error ? err.message : 'Unknown provider error',
        startedAt: new Date(attemptStart),
        completedAt: new Date(),
      },
    });

    await updatePaymentStatus(payment.id, 'UNKNOWN', requestId);
    throw err;
  }

  // 8. Update payment with provider data
  const durationMs = Date.now() - attemptStart;
  const newStatus = providerResponse.normalizedStatus;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        providerPaymentId: providerResponse.providerPaymentId,
        providerClientToken: providerResponse.providerClientToken,
        expiresAt: providerResponse.expiresAt,
      },
    });

    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        attemptNumber: 1,
        providerId: adapter.providerId,
        operation: 'CREATE_INTENT',
        status: newStatus,
        providerAttemptId: providerResponse.providerPaymentId,
        requestedAmountMinorUnits: amountMinorUnits,
        responseAmountMinorUnits: amountMinorUnits,
        currency,
        durationMs,
        startedAt: new Date(attemptStart),
        completedAt: new Date(),
      },
    });
  });

  // 9. Audit log
  await logPaymentAuditEvent({
    paymentId: payment.id,
    orderId,
    action: 'PAYMENT_CREATED',
    newStatus,
    actor: userId,
    providerId: adapter.providerId,
    amountMinorUnits,
    currency,
    requestId,
  });

  return {
    paymentId: payment.id,
    paymentNumber,
    providerClientToken: providerResponse.providerClientToken,
    amountMinorUnits,
    currency,
    status: newStatus,
  };
}

// ---------------------------------------------------------------------------
// CAPTURE PAYMENT
// ---------------------------------------------------------------------------

/**
 * Captures funds for an authorized payment.
 * Must be called server-side only — NEVER exposed to the browser directly.
 *
 * Validates:
 *  - Payment exists
 *  - Payment is in AUTHORIZED state
 *  - Order exists and belongs to payment
 *  - Capture amount ≤ authorized amount
 *  - Idempotency (prevents double capture)
 */
export async function capturePayment(
  paymentId: string,
  requestedBy: string,
  requestedByRole: string,
  idempotencyKey: string,
  requestId?: string
): Promise<CapturePaymentResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  // Check idempotency — if already captured, return success
  if (payment.status === 'CAPTURED' || payment.status === 'SUCCEEDED') {
    return {
      paymentId: payment.id,
      capturedAmountMinorUnits: payment.capturedMinorUnits,
      currency: payment.currency,
      status: payment.status as InternalPaymentStatus,
      capturedAt: payment.capturedAt!,
    };
  }

  // Validate state machine
  if (!CAPTURABLE_STATUSES.has(payment.status as InternalPaymentStatus)) {
    throw new PaymentNotCapturableError(payment.status);
  }

  const adapter = getPaymentAdapter();
  const captureAmount = payment.amountMinorUnits; // Capture full authorized amount
  const attemptStart = Date.now();

  let captureResponse;
  try {
    captureResponse = await adapter.capturePayment({
      providerPaymentId: payment.providerPaymentId!,
      amountMinorUnits: captureAmount,
      currency: payment.currency,
      idempotencyKey,
    });
  } catch (err) {
    const durationMs = Date.now() - attemptStart;
    const attempts = await prisma.paymentAttempt.count({ where: { paymentId } });

    await prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        attemptNumber: attempts + 1,
        providerId: adapter.providerId,
        operation: 'CAPTURE',
        status: 'UNKNOWN',
        requestedAmountMinorUnits: captureAmount,
        currency: payment.currency,
        durationMs,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        startedAt: new Date(attemptStart),
        completedAt: new Date(),
      },
    });

    // Set UNKNOWN — let reconciliation resolve
    await updatePaymentStatus(payment.id, 'UNKNOWN', requestId);
    throw err;
  }

  const durationMs = Date.now() - attemptStart;
  const newStatus = captureResponse.normalizedStatus;

  // DB transaction: update payment + order atomically
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        capturedMinorUnits: captureResponse.capturedAmountMinorUnits,
        capturedAt: captureResponse.capturedAt,
      },
    });

    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        attemptNumber: (await tx.paymentAttempt.count({ where: { paymentId } })) + 1,
        providerId: adapter.providerId,
        operation: 'CAPTURE',
        status: newStatus,
        providerAttemptId: payment.providerPaymentId,
        requestedAmountMinorUnits: captureAmount,
        responseAmountMinorUnits: captureResponse.capturedAmountMinorUnits,
        currency: payment.currency,
        durationMs,
        startedAt: new Date(attemptStart),
        completedAt: new Date(),
      },
    });

    // Transition order to CONFIRMED_PICKING
    if (newStatus === 'CAPTURED' || newStatus === 'SUCCEEDED') {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED_PICKING' },
      });
    }
  });

  await logPaymentAuditEvent({
    paymentId: payment.id,
    orderId: payment.orderId,
    action: 'PAYMENT_CAPTURED',
    previousStatus: payment.status,
    newStatus,
    actor: requestedBy,
    actorRole: requestedByRole,
    amountMinorUnits: captureResponse.capturedAmountMinorUnits,
    currency: payment.currency,
    requestId,
  });

  return {
    paymentId: payment.id,
    capturedAmountMinorUnits: captureResponse.capturedAmountMinorUnits,
    currency: payment.currency,
    status: newStatus,
    capturedAt: captureResponse.capturedAt,
  };
}

// ---------------------------------------------------------------------------
// PROCESS REFUND
// ---------------------------------------------------------------------------

/**
 * Processes a full or partial refund.
 *
 * Validates:
 *  - Payment exists and is in a refundable state
 *  - totalRefunded + newRefund ≤ capturedAmount
 *  - Idempotency prevents double-refunds
 *  - Authorization check (only authorized staff/system roles)
 */
export async function processRefund(
  paymentId: string,
  amountMinorUnits: number | null, // null = full refund
  reason: string,
  notes: string | undefined,
  requestedBy: string,
  requestedByRole: string,
  idempotencyKey: string,
  requestId?: string
): Promise<ProcessRefundResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  // Check idempotency — if a refund with this key already exists, return it
  const existingRefund = await prisma.refund.findUnique({ where: { idempotencyKey } });
  if (existingRefund) {
    return {
      refundId: existingRefund.id,
      refundNumber: existingRefund.refundNumber,
      paymentId: existingRefund.paymentId,
      amountMinorUnits: existingRefund.amountMinorUnits,
      currency: existingRefund.currency,
      status: existingRefund.status,
    };
  }

  // Validate refundable state
  if (!REFUNDABLE_STATUSES.has(payment.status as InternalPaymentStatus)) {
    throw new PaymentStateError(payment.status, 'REFUNDING');
  }

  // Determine refund amount
  const refundAmount = amountMinorUnits ?? (payment.capturedMinorUnits - payment.refundedMinorUnits);

  if (refundAmount <= 0) {
    throw new Error('[PaymentService] Refund amount must be positive');
  }

  // Enforce: totalRefunded + newRefund ≤ capturedAmount
  if (payment.refundedMinorUnits + refundAmount > payment.capturedMinorUnits) {
    throw new RefundExceedsCapturableError(
      payment.capturedMinorUnits,
      payment.refundedMinorUnits,
      refundAmount,
      payment.currency
    );
  }

  const adapter = getPaymentAdapter();
  const refundNumber = generateRefundNumber();

  // Create refund record (REQUESTED)
  const refund = await prisma.refund.create({
    data: {
      refundNumber,
      paymentId: payment.id,
      orderId: payment.orderId,
      amountMinorUnits: refundAmount,
      currency: payment.currency,
      providerId: adapter.providerId,
      reason,
      notes,
      status: 'REQUESTED',
      requestedBy,
      requestedByRole,
      idempotencyKey,
    },
  });

  // Call provider
  let refundResponse;
  try {
    refundResponse = await adapter.refundPayment({
      providerPaymentId: payment.providerPaymentId!,
      amountMinorUnits: refundAmount,
      currency: payment.currency,
      reason,
      idempotencyKey,
    });
  } catch (err) {
    await prisma.refund.update({
      where: { id: refund.id },
      data: { status: 'FAILED', failureReason: err instanceof Error ? err.message : 'Provider error' },
    });
    throw err;
  }

  // Determine new payment status
  const newRefundedTotal = payment.refundedMinorUnits + refundAmount;
  const newPaymentStatus: InternalPaymentStatus =
    newRefundedTotal >= payment.capturedMinorUnits ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

  // DB transaction: update refund + payment + order atomically
  await prisma.$transaction(async (tx) => {
    await tx.refund.update({
      where: { id: refund.id },
      data: {
        status: 'SUCCEEDED',
        providerRefundId: refundResponse.providerRefundId,
        completedAt: refundResponse.createdAt,
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        refundedMinorUnits: newRefundedTotal,
      },
    });

    // Update order status
    const orderStatus = newPaymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    });
  });

  await logPaymentAuditEvent({
    paymentId: payment.id,
    orderId: payment.orderId,
    refundId: refund.id,
    action: 'REFUND_COMPLETED',
    previousStatus: payment.status,
    newStatus: newPaymentStatus,
    actor: requestedBy,
    actorRole: requestedByRole,
    amountMinorUnits: refundAmount,
    currency: payment.currency,
    requestId,
  });

  return {
    refundId: refund.id,
    refundNumber,
    paymentId: payment.id,
    amountMinorUnits: refundAmount,
    currency: payment.currency,
    status: 'SUCCEEDED',
  };
}

// ---------------------------------------------------------------------------
// GET PAYMENT STATUS
// ---------------------------------------------------------------------------

export async function getPaymentStatus(
  paymentId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<PaymentStatusResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new PaymentNotFoundError(paymentId);
  }

  // Authorization: owner or staff
  const isOwner = payment.userId === requestingUserId;
  const isStaff = ['CLINICAL_PHARMACIST', 'OPS_WAREHOUSE', 'COMPLIANCE_ADMIN', 'SUPPORT_AGENT']
    .includes(requestingUserRole);

  if (!isOwner && !isStaff) {
    throw new PaymentAuthorizationError();
  }

  return {
    paymentId: payment.id,
    paymentNumber: payment.paymentNumber,
    orderId: payment.orderId,
    status: payment.status as InternalPaymentStatus,
    amountMinorUnits: payment.amountMinorUnits,
    capturedMinorUnits: payment.capturedMinorUnits,
    refundedMinorUnits: payment.refundedMinorUnits,
    currency: payment.currency,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// PROCESS NORMALIZED WEBHOOK EVENT
// ---------------------------------------------------------------------------

/**
 * Handles a normalized payment event produced by an adapter's normalizeWebhookEvent().
 *
 * SECURITY: This method is the server-side truth-writer.
 * It validates the amount/currency/order before any state change.
 * A browser redirect to a success page does NOT call this — only webhooks do.
 *
 * IDEMPOTENCY: If this event was already processed, returns without re-processing.
 */
export async function handleNormalizedEvent(
  event: NormalizedPaymentEvent,
  webhookEventId: string
): Promise<void> {
  // Find the payment by provider payment ID
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: event.providerPaymentId },
    include: { order: true },
  });

  if (!payment) {
    // Payment not found — could be a timing issue or test event
    console.warn(
      `[PaymentService] Webhook event ${event.type} for unknown providerPaymentId: ${event.providerPaymentId}`
    );
    return;
  }

  // Determine target status
  const targetStatus = eventTypeToStatus(event.type);
  if (!targetStatus) {
    console.warn(`[PaymentService] Cannot map event type ${event.type} to status`);
    return;
  }

  const currentStatus = payment.status as InternalPaymentStatus;

  // Validate state transition
  if (!isValidTransition(currentStatus, targetStatus)) {
    console.warn(
      `[PaymentService] Ignoring out-of-order webhook: ${currentStatus} → ${targetStatus} ` +
        `for payment ${payment.id}`
    );
    // Update webhook event to SKIPPED_DUPLICATE for audit trail
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { processingStatus: 'SKIPPED_DUPLICATE', processedAt: new Date() },
    });
    return;
  }

  // Amount/currency validation for capture/success events
  if (event.type === 'PAYMENT_CAPTURED' || event.type === 'PAYMENT_SUCCEEDED') {
    const capturedAmount =
      event.type === 'PAYMENT_CAPTURED'
        ? event.capturedAmountMinorUnits
        : event.amountMinorUnits;

    // Verify currency
    const eventCurrency = (event as { currency?: string }).currency?.toUpperCase();
    if (eventCurrency && eventCurrency !== payment.currency) {
      throw new CurrencyMismatchError(payment.currency, eventCurrency);
    }

    // CRITICAL: Verify amount matches exactly
    // A $1.25 payment for a $125.00 order must NOT mark the order paid
    if (capturedAmount !== payment.amountMinorUnits) {
      console.error(
        `[PaymentService] AMOUNT MISMATCH — expected ${payment.amountMinorUnits} ${payment.currency}, ` +
          `received ${capturedAmount}. Creating reconciliation record.`
      );

      // Create reconciliation record for investigation
      await prisma.reconciliationRecord.create({
        data: {
          provider: payment.providerId,
          providerTransactionId: event.providerPaymentId,
          internalPaymentId: payment.id,
          internalAmountMinorUnits: payment.amountMinorUnits,
          providerAmountMinorUnits: capturedAmount,
          differenceMinorUnits: capturedAmount - payment.amountMinorUnits,
          currency: payment.currency,
          internalStatus: currentStatus,
          providerStatus: event.type,
          reconciliationStatus: 'AMOUNT_MISMATCH',
        },
      });

      throw new AmountMismatchError(payment.amountMinorUnits, capturedAmount, payment.currency);
    }
  }

  // DB transaction: update payment + order + webhook event
  await prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = { status: targetStatus };

    if (event.type === 'PAYMENT_AUTHORIZED') {
      updateData.authorizedAt = event.providerTimestamp;
      updateData.capturedMinorUnits = (event as { amountMinorUnits?: number }).amountMinorUnits ?? payment.amountMinorUnits;
    }
    if (event.type === 'PAYMENT_CAPTURED' || event.type === 'PAYMENT_SUCCEEDED') {
      const captured = event.type === 'PAYMENT_CAPTURED'
        ? (event as { capturedAmountMinorUnits: number }).capturedAmountMinorUnits
        : (event as { amountMinorUnits: number }).amountMinorUnits;
      updateData.capturedAt = event.providerTimestamp;
      updateData.capturedMinorUnits = captured;
    }
    if (event.type === 'PAYMENT_FAILED') {
      updateData.failedAt = event.providerTimestamp;
      updateData.failureCode = (event as { failureCode?: string }).failureCode;
      updateData.failureMessage = (event as { failureMessage?: string }).failureMessage;
    }
    if (event.type === 'PAYMENT_CANCELLED') {
      updateData.cancelledAt = event.providerTimestamp;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    // Update order status based on payment event
    let orderStatus: string | null = null;

    if (event.type === 'PAYMENT_CAPTURED' || event.type === 'PAYMENT_SUCCEEDED') {
      orderStatus = 'CONFIRMED_PICKING';
    } else if (event.type === 'PAYMENT_FAILED') {
      orderStatus = 'PAYMENT_FAILED';
    } else if (event.type === 'PAYMENT_CANCELLED') {
      orderStatus = 'CANCELLED';
    } else if (event.type === 'PAYMENT_REFUNDED') {
      orderStatus = 'REFUNDED';
    } else if (event.type === 'PAYMENT_PARTIALLY_REFUNDED') {
      orderStatus = 'PARTIALLY_REFUNDED';
    }

    if (orderStatus) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: orderStatus as import('@prisma/client').OrderStatus },
      });
    }

    // Mark webhook event as processed
    await tx.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        paymentId: payment.id,
        processingStatus: 'PROCESSED',
        processedAt: new Date(),
        normalizedEventType: event.type,
      },
    });
  });

  await logPaymentAuditEvent({
    paymentId: payment.id,
    orderId: payment.orderId,
    webhookEventId,
    action: `WEBHOOK_${event.type}`,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    actor: 'WEBHOOK',
    providerId: event.provider,
    providerEventId: event.providerEventId,
    currency: payment.currency,
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function updatePaymentStatus(
  paymentId: string,
  status: InternalPaymentStatus,
  requestId?: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  const previousStatus = payment.status;

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status },
  });

  await logPaymentAuditEvent({
    paymentId,
    action: 'PAYMENT_STATUS_CHANGED',
    previousStatus: previousStatus as InternalPaymentStatus,
    newStatus: status,
    actor: 'SYSTEM',
    requestId,
  });
}
