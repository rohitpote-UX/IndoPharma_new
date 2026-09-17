/**
 * ==============================================================================
 * INDOPHARM — MOCK PAYMENT ADAPTER (EVENT MAPPER)
 * ==============================================================================
 * Translates mock provider webhook events into provider-agnostic
 * NormalizedPaymentEvent types consumed by the PaymentService.
 *
 * This mapper is the ONLY place where mock-specific event type strings
 * appear. No other module should reference mock provider internals.
 * ==============================================================================
 */

import type { NormalizedPaymentEvent } from '../../domain/payment-events';
import type { VerifiedWebhookEvent } from '../../types';

/**
 * Mock provider event type strings.
 * These must NEVER leak outside the adapter layer.
 */
type MockEventType =
  | 'payment.authorized'
  | 'payment.captured'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.refunded'
  | 'payment.partial_refund'
  | 'payment.disputed'
  | 'payment.chargeback'
  | 'payment.requires_action';

/**
 * Maps a verified mock webhook event into a normalized IndoPharm event.
 * Throws if the event type is unrecognized (triggers UNKNOWN status).
 */
export function mapMockEventToNormalized(
  verified: VerifiedWebhookEvent
): NormalizedPaymentEvent {
  const payload = verified.rawPayload;
  const providerPaymentId = String(payload.payment_id || payload.paymentId || '');
  const providerTimestamp = payload.created_at
    ? new Date(String(payload.created_at))
    : new Date();
  const amountMinorUnits = typeof payload.amount === 'number' ? payload.amount : 0;
  const currency = String(payload.currency || 'USD').toUpperCase();

  const base = {
    provider: 'mock',
    providerEventId: verified.providerEventId,
    providerPaymentId,
    providerTimestamp,
  };

  const eventType = verified.providerEventType as MockEventType;

  switch (eventType) {
    case 'payment.authorized':
      return {
        ...base,
        type: 'PAYMENT_AUTHORIZED',
        amountMinorUnits,
        currency,
      };

    case 'payment.captured':
      return {
        ...base,
        type: 'PAYMENT_CAPTURED',
        capturedAmountMinorUnits: amountMinorUnits,
        currency,
      };

    case 'payment.succeeded':
      return {
        ...base,
        type: 'PAYMENT_SUCCEEDED',
        amountMinorUnits,
        currency,
      };

    case 'payment.failed':
      return {
        ...base,
        type: 'PAYMENT_FAILED',
        failureCode: String(payload.failure_code || payload.error_code || 'DECLINED'),
        failureMessage: String(payload.failure_message || payload.error_message || 'Payment declined'),
      };

    case 'payment.cancelled':
      return {
        ...base,
        type: 'PAYMENT_CANCELLED',
        reason: String(payload.reason || 'Cancelled'),
      };

    case 'payment.refunded':
      return {
        ...base,
        type: 'PAYMENT_REFUNDED',
        refundAmountMinorUnits: amountMinorUnits,
        currency,
        providerRefundId: String(payload.refund_id || ''),
      };

    case 'payment.partial_refund':
      return {
        ...base,
        type: 'PAYMENT_PARTIALLY_REFUNDED',
        refundAmountMinorUnits: amountMinorUnits,
        currency,
        providerRefundId: String(payload.refund_id || ''),
      };

    case 'payment.disputed':
      return {
        ...base,
        type: 'PAYMENT_DISPUTED',
        disputeAmountMinorUnits: amountMinorUnits,
        currency,
        disputeReason: String(payload.reason || 'Unknown'),
        providerDisputeId: String(payload.dispute_id || ''),
      };

    case 'payment.chargeback':
      return {
        ...base,
        type: 'PAYMENT_CHARGEBACK',
        chargebackAmountMinorUnits: amountMinorUnits,
        currency,
        providerDisputeId: String(payload.dispute_id || ''),
      };

    case 'payment.requires_action':
      return {
        ...base,
        type: 'PAYMENT_REQUIRES_ACTION',
        actionUrl: String(payload.action_url || ''),
      };

    default:
      return {
        ...base,
        type: 'PAYMENT_STATUS_UNKNOWN',
        rawProviderStatus: String(eventType),
      };
  }
}
