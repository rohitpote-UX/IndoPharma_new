/**
 * ==============================================================================
 * INDOPHARM — PAYMENT AUDIT LOGGER
 * ==============================================================================
 * Payment-specific financial audit logger that writes to the PaymentAuditEvent
 * table in the database.
 *
 * Rules:
 *  - NEVER log: API keys, webhook secrets, card numbers, CVV, credentials
 *  - Always include correlation IDs (paymentId, orderId, requestId)
 *  - Always record previous/new status on state changes
 *  - Actor must be a userId, "SYSTEM", "WEBHOOK", or "RECONCILIATION"
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';
import type { InternalPaymentStatus } from './domain/payment-status';

export interface PaymentAuditEventData {
  paymentId?: string;
  orderId?: string;
  attemptId?: string;
  refundId?: string;
  webhookEventId?: string;
  requestId?: string;
  action: string;
  previousStatus?: InternalPaymentStatus | string;
  newStatus?: InternalPaymentStatus | string;
  actor?: string;
  actorRole?: string;
  ipAddress?: string;
  providerId?: string;
  providerEventId?: string;
  amountMinorUnits?: number;
  currency?: string;
  /** Safe metadata only — no credentials */
  metadata?: Record<string, unknown>;
}

/**
 * Writes an immutable payment audit event to the database.
 * Also emits a structured JSON log for observability/APM.
 *
 * This function never throws — audit failures must not break payment flows.
 * Failures are logged to stderr.
 */
export async function logPaymentAuditEvent(data: PaymentAuditEventData): Promise<void> {
  const timestamp = new Date();

  // Structured log for observability (safe — no credentials)
  console.info(
    JSON.stringify({
      payment_audit: true,
      timestamp: timestamp.toISOString(),
      action: data.action,
      paymentId: data.paymentId,
      orderId: data.orderId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      actor: data.actor,
      providerId: data.providerId,
      amountMinorUnits: data.amountMinorUnits,
      currency: data.currency,
      requestId: data.requestId,
    })
  );

  // Persist to database
  try {
    await prisma.paymentAuditEvent.create({
      data: {
        paymentId: data.paymentId,
        orderId: data.orderId,
        attemptId: data.attemptId,
        refundId: data.refundId,
        webhookEventId: data.webhookEventId,
        requestId: data.requestId,
        action: data.action,
        previousStatus: data.previousStatus,
        newStatus: data.newStatus,
        actor: data.actor,
        actorRole: data.actorRole,
        ipAddress: data.ipAddress,
        providerId: data.providerId,
        providerEventId: data.providerEventId,
        amountMinorUnits: data.amountMinorUnits,
        currency: data.currency,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        timestamp,
      },
    });
  } catch (err) {
    // Audit failures must not break payment flows
    console.error('[PaymentAudit] Failed to write audit event to database:', err);
  }
}
