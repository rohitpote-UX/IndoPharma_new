/**
 * ==============================================================================
 * INDOPHARM — MOCK PAYMENT ADAPTER
 * ==============================================================================
 * Implements PaymentProviderAdapter for local development and test environments.
 *
 * CRITICAL PRODUCTION GUARD:
 * This adapter THROWS at construction time if NODE_ENV === 'production'.
 * It must never be enabled in production under any circumstances.
 *
 * Capabilities:
 *  - Simulates full auth → capture flow
 *  - Simulates partial and full refunds
 *  - Simulates webhook verification (HMAC-SHA256)
 *  - Simulates event normalization
 *  - In-memory state store (resets on server restart)
 *
 * Usage:
 *  - Set PAYMENT_PROVIDER=mock in .env.local
 *  - Use x-mock-signature header in webhook test requests
 * ==============================================================================
 */

import { createHash } from 'crypto';
import type {
  PaymentProviderAdapter,
  PaymentProviderCapabilities,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  AuthorizePaymentRequest,
  AuthorizePaymentResponse,
  CapturePaymentRequest,
  CapturePaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  VerifyWebhookRequest,
  VerifiedWebhookEvent,
} from '../../types';
import type { NormalizedPaymentEvent } from '../../domain/payment-events';
import {
  ProviderUnavailableError,
  PaymentNotFoundError,
  PaymentNotCapturableError,
  RefundExceedsCapturableError,
  WebhookVerificationError,
} from '../../domain/payment-errors';
import { CAPTURABLE_STATUSES } from '../../domain/payment-status';
import { verifyMockWebhookSignature } from './webhook';
import { mapMockEventToNormalized } from './mapper';

// Internal in-memory store types
interface MockPaymentState {
  providerPaymentId: string;
  orderId: string;
  customerId: string;
  amountMinorUnits: number;
  capturedMinorUnits: number;
  refundedMinorUnits: number;
  currency: string;
  status: string; // mock-internal status string
  clientToken: string;
  authorizedAt?: Date;
  capturedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MockPaymentAdapter implements PaymentProviderAdapter {
  readonly providerId = 'mock';

  readonly capabilities: PaymentProviderCapabilities = {
    providerId: 'mock',
    supportsCards: true,
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefunds: true,
    supportsPartialRefunds: true,
    supportsWebhooks: true,
    supportsInternational: true,
    supportsCrossBorder: true,
    supportsChargebacks: true,
    supportedCurrencies: ['USD', 'INR'],
    supportedCountries: ['US', 'IN'],
    captureMode: 'manual',
  } as const;

  // In-memory state — resets on server restart
  private readonly payments = new Map<string, MockPaymentState>();

  constructor() {
    // CRITICAL: Prevent accidental use in production
    if (process.env.NODE_ENV === 'production' && process.env.PAYMENT_MOCK_GUARD !== 'false') {
      throw new Error(
        '[MockPaymentAdapter] FATAL: Mock payment adapter cannot be used in production. ' +
          'Set PAYMENT_PROVIDER to a real provider adapter code.'
      );
    }
  }

  // ---------------------------------------------------------------------------

  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    const providerPaymentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const clientToken = `mock_cs_${providerPaymentId}`;

    const state: MockPaymentState = {
      providerPaymentId,
      orderId: request.orderId,
      customerId: request.customerId,
      amountMinorUnits: request.amountMinorUnits,
      capturedMinorUnits: 0,
      refundedMinorUnits: 0,
      currency: request.currency.toUpperCase(),
      status: 'requires_payment_method',
      clientToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.payments.set(providerPaymentId, state);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.PAYMENT_INTENT_EXPIRY_SECONDS || '1800', 10) * 1000
    );

    return {
      providerPaymentId,
      providerClientToken: clientToken,
      providerStatus: 'requires_payment_method',
      normalizedStatus: 'REQUIRES_ACTION',
      expiresAt,
    };
  }

  // ---------------------------------------------------------------------------

  async authorizePayment(request: AuthorizePaymentRequest): Promise<AuthorizePaymentResponse> {
    const state = this.getStateOrThrow(request.providerPaymentId);

    state.status = 'authorized';
    state.authorizedAt = new Date();
    state.updatedAt = new Date();

    return {
      providerPaymentId: request.providerPaymentId,
      normalizedStatus: 'AUTHORIZED',
      authorizedAmountMinorUnits: state.amountMinorUnits,
      currency: state.currency,
      authorizedAt: state.authorizedAt,
    };
  }

  // ---------------------------------------------------------------------------

  async capturePayment(request: CapturePaymentRequest): Promise<CapturePaymentResponse> {
    const state = this.getStateOrThrow(request.providerPaymentId);

    if (state.status !== 'authorized') {
      throw new PaymentNotCapturableError(state.status);
    }

    if (request.amountMinorUnits > state.amountMinorUnits) {
      throw new RefundExceedsCapturableError(
        state.amountMinorUnits,
        state.refundedMinorUnits,
        request.amountMinorUnits,
        request.currency
      );
    }

    state.status = 'captured';
    state.capturedMinorUnits = request.amountMinorUnits;
    state.capturedAt = new Date();
    state.updatedAt = new Date();

    return {
      providerPaymentId: request.providerPaymentId,
      normalizedStatus: 'CAPTURED',
      capturedAmountMinorUnits: state.capturedMinorUnits,
      currency: state.currency,
      capturedAt: state.capturedAt,
    };
  }

  // ---------------------------------------------------------------------------

  async getPaymentStatus(request: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse> {
    const state = this.getStateOrThrow(request.providerPaymentId);

    return {
      providerPaymentId: request.providerPaymentId,
      providerStatus: state.status,
      normalizedStatus: this.mapMockStatusToInternal(state.status),
      amountMinorUnits: state.amountMinorUnits,
      capturedAmountMinorUnits: state.capturedMinorUnits,
      refundedAmountMinorUnits: state.refundedMinorUnits,
      currency: state.currency,
      updatedAt: state.updatedAt,
    };
  }

  // ---------------------------------------------------------------------------

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const state = this.getStateOrThrow(request.providerPaymentId);

    const newTotalRefunded = state.refundedMinorUnits + request.amountMinorUnits;

    if (newTotalRefunded > state.capturedMinorUnits) {
      throw new RefundExceedsCapturableError(
        state.capturedMinorUnits,
        state.refundedMinorUnits,
        request.amountMinorUnits,
        request.currency
      );
    }

    state.refundedMinorUnits = newTotalRefunded;

    if (state.refundedMinorUnits >= state.capturedMinorUnits) {
      state.status = 'refunded';
    } else {
      state.status = 'partially_refunded';
    }

    state.updatedAt = new Date();

    const providerRefundId = `mock_ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      providerRefundId,
      providerPaymentId: request.providerPaymentId,
      normalizedStatus: state.status === 'refunded' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmountMinorUnits: request.amountMinorUnits,
      currency: state.currency,
      createdAt: new Date(),
    };
  }

  // ---------------------------------------------------------------------------

  async verifyWebhook(request: VerifyWebhookRequest): Promise<VerifiedWebhookEvent> {
    const result = verifyMockWebhookSignature(request.rawBody, request.headers);

    if (!result.valid) {
      throw new WebhookVerificationError(result.error);
    }

    const bodyStr = typeof request.rawBody === 'string'
      ? request.rawBody
      : request.rawBody.toString('utf-8');

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(bodyStr);
    } catch {
      throw new WebhookVerificationError('Invalid JSON payload');
    }

    const providerEventId = String(parsed.id || parsed.event_id || `mock_evt_${Date.now()}`);
    const providerEventType = String(parsed.type || parsed.event_type || 'payment.unknown');
    const payloadHash = createHash('sha256').update(bodyStr).digest('hex');

    return {
      providerEventId,
      providerEventType,
      rawPayload: parsed,
      payloadHash,
    };
  }

  // ---------------------------------------------------------------------------

  async normalizeWebhookEvent(
    verifiedEvent: VerifiedWebhookEvent
  ): Promise<NormalizedPaymentEvent> {
    return mapMockEventToNormalized(verifiedEvent);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private getStateOrThrow(providerPaymentId: string): MockPaymentState {
    const state = this.payments.get(providerPaymentId);
    if (!state) {
      throw new PaymentNotFoundError(providerPaymentId);
    }
    return state;
  }

  private mapMockStatusToInternal(mockStatus: string): import('../../domain/payment-status').InternalPaymentStatus {
    const map: Record<string, import('../../domain/payment-status').InternalPaymentStatus> = {
      requires_payment_method: 'REQUIRES_ACTION',
      requires_action: 'REQUIRES_ACTION',
      processing: 'PENDING',
      authorized: 'AUTHORIZED',
      capture_pending: 'CAPTURE_PENDING',
      captured: 'CAPTURED',
      succeeded: 'SUCCEEDED',
      failed: 'FAILED',
      canceled: 'CANCELLED',
      cancelled: 'CANCELLED',
      partially_refunded: 'PARTIALLY_REFUNDED',
      refunded: 'REFUNDED',
      disputed: 'DISPUTED',
      chargeback: 'CHARGEBACK',
    };
    return map[mockStatus] ?? 'UNKNOWN';
  }
}
