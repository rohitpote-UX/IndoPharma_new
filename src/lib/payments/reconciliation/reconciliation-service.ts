/**
 * ==============================================================================
 * INDOPHARM — RECONCILIATION SERVICE
 * ==============================================================================
 * Compares internal payment records against provider-reported state.
 *
 * Purpose:
 *  - Detect amount mismatches
 *  - Detect status inconsistencies
 *  - Handle network failures (payment succeeded at provider but backend missed it)
 *  - Support finance team investigations
 *
 * CRITICAL RULE:
 *  Do NOT silently auto-correct financial mismatches.
 *  Create a ReconciliationRecord and flag for human investigation.
 *  Only well-understood, idempotent corrections may be automated.
 *
 * Architecture:
 *  This service is called by:
 *   - Scheduled jobs (nightly reconciliation)
 *   - Manual admin triggers
 *   - Recovery flows (after network failure)
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { getPaymentAdapter } from '../provider';
import { logPaymentAuditEvent } from '../audit';
import type { InternalPaymentStatus } from '../domain/payment-status';

export type ReconciliationOutcome =
  | 'MATCHED'
  | 'MISMATCH'
  | 'AMOUNT_MISMATCH'
  | 'STATUS_MISMATCH'
  | 'CURRENCY_MISMATCH'
  | 'MISSING_PROVIDER'
  | 'MISSING_INTERNAL';

export interface ReconciliationResult {
  paymentId: string;
  outcome: ReconciliationOutcome;
  internalStatus: InternalPaymentStatus;
  providerStatus: string;
  internalAmountMinorUnits: number;
  providerAmountMinorUnits: number;
  currency: string;
  requiresInvestigation: boolean;
  reconciliationRecordId?: string;
}

/**
 * Reconciles a single payment against the current provider state.
 *
 * Fetches authoritative status from the provider and compares with our records.
 * Creates a ReconciliationRecord for any discrepancy.
 */
export async function reconcilePayment(paymentId: string): Promise<ReconciliationResult> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(`[ReconciliationService] Payment not found: ${paymentId}`);
  }

  if (!payment.providerPaymentId) {
    // No provider ID yet — payment was created but provider call failed
    return {
      paymentId: payment.id,
      outcome: 'MISSING_PROVIDER',
      internalStatus: payment.status as InternalPaymentStatus,
      providerStatus: 'N/A',
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: 0,
      currency: payment.currency,
      requiresInvestigation: true,
    };
  }

  // Fetch authoritative provider state
  const adapter = getPaymentAdapter();
  let providerState;

  try {
    providerState = await adapter.getPaymentStatus({
      providerPaymentId: payment.providerPaymentId,
    });
  } catch (err) {
    console.error(`[ReconciliationService] Failed to fetch provider state for ${paymentId}:`, err);
    return {
      paymentId: payment.id,
      outcome: 'MISSING_PROVIDER',
      internalStatus: payment.status as InternalPaymentStatus,
      providerStatus: 'FETCH_FAILED',
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: 0,
      currency: payment.currency,
      requiresInvestigation: true,
    };
  }

  // Compare currency
  if (providerState.currency.toUpperCase() !== payment.currency) {
    const record = await createReconciliationRecord({
      provider: payment.providerId,
      providerTransactionId: payment.providerPaymentId,
      internalPaymentId: payment.id,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      currency: payment.currency,
      internalStatus: payment.status,
      providerStatus: providerState.providerStatus,
      reconciliationStatus: 'CURRENCY_MISMATCH',
    });

    return {
      paymentId: payment.id,
      outcome: 'CURRENCY_MISMATCH',
      internalStatus: payment.status as InternalPaymentStatus,
      providerStatus: providerState.providerStatus,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      currency: payment.currency,
      requiresInvestigation: true,
      reconciliationRecordId: record.id,
    };
  }

  // Compare amounts
  if (providerState.amountMinorUnits !== payment.amountMinorUnits) {
    console.error(
      `[ReconciliationService] AMOUNT MISMATCH for payment ${paymentId}: ` +
        `internal=${payment.amountMinorUnits}, provider=${providerState.amountMinorUnits}`
    );

    const record = await createReconciliationRecord({
      provider: payment.providerId,
      providerTransactionId: payment.providerPaymentId,
      internalPaymentId: payment.id,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      differenceMinorUnits: providerState.amountMinorUnits - payment.amountMinorUnits,
      currency: payment.currency,
      internalStatus: payment.status,
      providerStatus: providerState.providerStatus,
      reconciliationStatus: 'AMOUNT_MISMATCH',
    });

    await logPaymentAuditEvent({
      paymentId: payment.id,
      orderId: payment.orderId,
      action: 'RECONCILIATION_AMOUNT_MISMATCH',
      actor: 'RECONCILIATION',
      amountMinorUnits: payment.amountMinorUnits,
      currency: payment.currency,
      metadata: {
        providerAmount: providerState.amountMinorUnits,
        difference: providerState.amountMinorUnits - payment.amountMinorUnits,
      },
    });

    return {
      paymentId: payment.id,
      outcome: 'AMOUNT_MISMATCH',
      internalStatus: payment.status as InternalPaymentStatus,
      providerStatus: providerState.providerStatus,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      currency: payment.currency,
      requiresInvestigation: true,
      reconciliationRecordId: record.id,
    };
  }

  // Compare normalized status
  const internalStatus = payment.status as InternalPaymentStatus;
  const providerNormalizedStatus = providerState.normalizedStatus;

  if (internalStatus !== providerNormalizedStatus) {
    const record = await createReconciliationRecord({
      provider: payment.providerId,
      providerTransactionId: payment.providerPaymentId,
      internalPaymentId: payment.id,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      currency: payment.currency,
      internalStatus: payment.status,
      providerStatus: providerState.providerStatus,
      reconciliationStatus: 'STATUS_MISMATCH',
    });

    return {
      paymentId: payment.id,
      outcome: 'STATUS_MISMATCH',
      internalStatus,
      providerStatus: providerState.providerStatus,
      internalAmountMinorUnits: payment.amountMinorUnits,
      providerAmountMinorUnits: providerState.amountMinorUnits,
      currency: payment.currency,
      requiresInvestigation: true,
      reconciliationRecordId: record.id,
    };
  }

  // All matched — record a clean reconciliation
  await createReconciliationRecord({
    provider: payment.providerId,
    providerTransactionId: payment.providerPaymentId,
    internalPaymentId: payment.id,
    internalAmountMinorUnits: payment.amountMinorUnits,
    providerAmountMinorUnits: providerState.amountMinorUnits,
    currency: payment.currency,
    internalStatus: payment.status,
    providerStatus: providerState.providerStatus,
    reconciliationStatus: 'MATCHED',
  });

  return {
    paymentId: payment.id,
    outcome: 'MATCHED',
    internalStatus,
    providerStatus: providerState.providerStatus,
    internalAmountMinorUnits: payment.amountMinorUnits,
    providerAmountMinorUnits: providerState.amountMinorUnits,
    currency: payment.currency,
    requiresInvestigation: false,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ReconciliationRecordInput {
  provider: string;
  providerTransactionId?: string;
  internalPaymentId?: string;
  internalAmountMinorUnits?: number;
  providerAmountMinorUnits?: number;
  differenceMinorUnits?: number;
  currency?: string;
  internalStatus?: string;
  providerStatus?: string;
  reconciliationStatus: string;
}

async function createReconciliationRecord(data: ReconciliationRecordInput) {
  return prisma.reconciliationRecord.create({
    data: {
      provider: data.provider,
      providerTransactionId: data.providerTransactionId,
      internalPaymentId: data.internalPaymentId,
      internalAmountMinorUnits: data.internalAmountMinorUnits,
      providerAmountMinorUnits: data.providerAmountMinorUnits,
      differenceMinorUnits: data.differenceMinorUnits,
      currency: data.currency,
      internalStatus: data.internalStatus,
      providerStatus: data.providerStatus,
      reconciliationStatus: data.reconciliationStatus as import('@prisma/client').ReconciliationStatus,
    },
  });
}
