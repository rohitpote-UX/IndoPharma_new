/**
 * ==============================================================================
 * INDOPHARM — GATEWAY-AGNOSTIC PAYMENT ABSTRACTION TYPES
 * ==============================================================================
 * IMPORTANT — GOLDEN RULE:
 * IndoPharm isolates ALL payment orchestration behind these provider-agnostic
 * interfaces. No vendor-specific SDK (Stripe, PayPal, Adyen, Razorpay, etc.)
 * is allowed to appear in core domain, checkout, or order lifecycle code.
 *
 * The checkout must NEVER import:
 *  - Provider SDKs
 *  - Provider-specific API clients
 *  - Provider-specific response types
 *  - Provider-specific webhook logic
 *  - Provider-specific payment status names
 *
 * Every provider adapter must implement PaymentProviderAdapter.
 * ==============================================================================
 */

import type { NormalizedPaymentEvent } from './domain/payment-events';
import type { InternalPaymentStatus } from './domain/payment-status';

// ------------------------------------------------------------------------------
// LEGACY TYPES — kept for backwards compatibility with existing checkout service.
// New code should use PaymentProviderAdapter + the domain types.
// ------------------------------------------------------------------------------

export type PaymentStatus =
  | 'DRAFT'
  | 'REQUIRES_PAYMENT_METHOD'
  | 'REQUIRES_CONFIRMATION'
  | 'REQUIRES_ACTION'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'CANCELED'
  | 'REFUNDED'
  | 'FAILED';

export interface PaymentIntent {
  id: string;
  externalId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  orderId: string;
  customerId: string;
  clientSecret: string | null;
  paymentMethodType?: string;
  capturedAmount: number;
  refundedAmount: number;
  errorMessage?: string | null;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number;
  reason:
    | 'PRESCRIPTION_REJECTED'
    | 'CUSTOMER_CANCELLATION'
    | 'CUSTOMS_NON_DELIVERY'
    | 'SUSPECTED_FRAUD'
    | 'ADMIN_DISCRETION';
  note?: string;
}

export interface RefundResult {
  refundId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  type: string;
  payload: Record<string, unknown>;
  signature: string;
  timestamp: Date;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  event?: WebhookEvent;
  error?: string;
}

export interface CreateIntentParams {
  orderId: string;
  amount: number;
  currency: string;
  customerId: string;
  metadata?: Record<string, string>;
}

/**
 * @deprecated Use PaymentProviderAdapter instead.
 * Legacy interface kept for compatibility with MockPaymentProvider.
 */
export interface PaymentProvider {
  readonly providerId: string;
  createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntent>;
  authorizePayment(paymentIntentId: string, paymentMethodDetails?: unknown): Promise<PaymentIntent>;
  capturePayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
  cancelPaymentIntent(paymentIntentId: string, reason?: string): Promise<PaymentIntent>;
  processRefund(request: RefundRequest): Promise<RefundResult>;
  verifyWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<PaymentVerificationResult>;
}

// ------------------------------------------------------------------------------
// PHASE 15 — FULL PAYMENT PROVIDER ADAPTER INTERFACE
// All new provider implementations must implement this interface.
// ------------------------------------------------------------------------------

/**
 * Capability matrix for a payment provider.
 * The PaymentService checks capabilities before attempting operations.
 */
export interface PaymentProviderCapabilities {
  readonly providerId: string;
  readonly supportsCards: boolean;
  readonly supportsAuthorization: boolean;       // Auth separate from capture
  readonly supportsCapture: boolean;
  readonly supportsRefunds: boolean;
  readonly supportsPartialRefunds: boolean;
  readonly supportsWebhooks: boolean;
  readonly supportsInternational: boolean;
  readonly supportsCrossBorder: boolean;
  readonly supportsChargebacks: boolean;
  readonly supportedCurrencies: readonly string[];
  readonly supportedCountries: readonly string[];
  readonly captureMode: 'manual' | 'automatic';
}

// Request / Response types for each adapter operation

export interface CreatePaymentIntentRequest {
  /** Internal order ID */
  orderId: string;
  /** Internal customer/user ID */
  customerId: string;
  /** Amount in integer minor units — NEVER float */
  amountMinorUnits: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Safe metadata (no credentials, no secrets) */
  metadata?: Record<string, string>;
  /** Idempotency key for this specific create operation */
  idempotencyKey: string;
  /** Capture mode override — defaults to provider's configured mode */
  captureMode?: 'manual' | 'automatic';
}

export interface CreatePaymentIntentResponse {
  /** Provider's internal payment/intent ID */
  providerPaymentId: string;
  /**
   * Client token safe to return to the browser.
   * Used by frontend to render provider-hosted payment UI.
   * NEVER a secret API key.
   */
  providerClientToken: string | null;
  /** Provider's interpretation of current status */
  providerStatus: string;
  /** Normalized IndoPharm status */
  normalizedStatus: InternalPaymentStatus;
  /** Expiry of this payment intent */
  expiresAt?: Date;
}

export interface AuthorizePaymentRequest {
  providerPaymentId: string;
  /** Optional payment method details (e.g. tokenized card reference) */
  paymentMethodId?: string;
  idempotencyKey: string;
}

export interface AuthorizePaymentResponse {
  providerPaymentId: string;
  normalizedStatus: InternalPaymentStatus;
  authorizedAmountMinorUnits: number;
  currency: string;
  authorizedAt: Date;
}

export interface CapturePaymentRequest {
  providerPaymentId: string;
  /** Amount to capture in minor units — must not exceed authorized amount */
  amountMinorUnits: number;
  currency: string;
  idempotencyKey: string;
}

export interface CapturePaymentResponse {
  providerPaymentId: string;
  normalizedStatus: InternalPaymentStatus;
  capturedAmountMinorUnits: number;
  currency: string;
  capturedAt: Date;
}

export interface GetPaymentStatusRequest {
  providerPaymentId: string;
}

export interface GetPaymentStatusResponse {
  providerPaymentId: string;
  providerStatus: string;
  normalizedStatus: InternalPaymentStatus;
  amountMinorUnits: number;
  capturedAmountMinorUnits: number;
  refundedAmountMinorUnits: number;
  currency: string;
  updatedAt: Date;
}

export interface RefundPaymentRequest {
  providerPaymentId: string;
  /** Amount to refund in minor units */
  amountMinorUnits: number;
  currency: string;
  reason: string;
  idempotencyKey: string;
  providerRefundId?: string; // If retrying an existing refund
}

export interface RefundPaymentResponse {
  providerRefundId: string;
  providerPaymentId: string;
  normalizedStatus: InternalPaymentStatus;
  refundedAmountMinorUnits: number;
  currency: string;
  createdAt: Date;
}

export interface VerifyWebhookRequest {
  /** Raw request body — must not be pre-parsed (signature covers raw bytes) */
  rawBody: Buffer | string;
  /** All request headers */
  headers: Record<string, string>;
  /** Provider code — allows the handler to select the right verification logic */
  provider: string;
}

export interface VerifiedWebhookEvent {
  /** Provider's unique event ID */
  providerEventId: string;
  /** Provider's raw event type string (before normalization) */
  providerEventType: string;
  /** Raw payload (for storage/debugging) */
  rawPayload: Record<string, unknown>;
  /** SHA-256 hash of raw body (for deduplication, not as a secret) */
  payloadHash: string;
}

/**
 * ==============================================================================
 * PaymentProviderAdapter
 * ==============================================================================
 * The central contract that ALL payment provider implementations must fulfill.
 *
 * Architecture rule:
 *   Checkout → PaymentService → PaymentProviderAdapter → Provider
 *
 * Checkout must NEVER import an adapter directly.
 * ==============================================================================
 */
export interface PaymentProviderAdapter {
  /** Provider identifier matching PaymentProviderConfig.code in the database */
  readonly providerId: string;

  /** Capability matrix — consulted before each operation */
  readonly capabilities: PaymentProviderCapabilities;

  /**
   * Creates a payment intent with the provider.
   * Amount is verified server-side before this call — NEVER trust client amount.
   */
  createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse>;

  /**
   * Authorizes (reserves) funds without capturing.
   * Only call if capabilities.supportsAuthorization is true.
   */
  authorizePayment(
    request: AuthorizePaymentRequest
  ): Promise<AuthorizePaymentResponse>;

  /**
   * Captures previously authorized funds.
   * Must be called server-side only — NEVER from the browser.
   */
  capturePayment(
    request: CapturePaymentRequest
  ): Promise<CapturePaymentResponse>;

  /**
   * Retrieves authoritative payment status from the provider.
   * Used during reconciliation and after network failures.
   */
  getPaymentStatus(
    request: GetPaymentStatusRequest
  ): Promise<GetPaymentStatusResponse>;

  /**
   * Initiates a full or partial refund.
   * Idempotency key prevents double-refunds on retry.
   */
  refundPayment(
    request: RefundPaymentRequest
  ): Promise<RefundPaymentResponse>;

  /**
   * Verifies the authenticity of an incoming webhook request.
   * Uses the provider's documented signature verification mechanism.
   * MUST be called before any webhook payload is processed.
   */
  verifyWebhook(
    request: VerifyWebhookRequest
  ): Promise<VerifiedWebhookEvent>;

  /**
   * Translates a raw, verified provider webhook event into a
   * provider-agnostic NormalizedPaymentEvent.
   * Called after verifyWebhook succeeds.
   */
  normalizeWebhookEvent(
    verifiedEvent: VerifiedWebhookEvent
  ): Promise<NormalizedPaymentEvent>;
}
