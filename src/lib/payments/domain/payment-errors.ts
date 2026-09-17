/**
 * ==============================================================================
 * INDOPHARM — PAYMENT ERROR TYPES
 * ==============================================================================
 * Typed error hierarchy for payment domain.
 * These errors are for internal use — safe, application-level messages
 * are returned to clients through the API layer.
 *
 * NEVER expose raw provider errors to customers.
 * ==============================================================================
 */

/** Base payment error — all payment errors extend this. */
export class PaymentError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Payment record not found in the database. */
export class PaymentNotFoundError extends PaymentError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`, 'PAYMENT_NOT_FOUND', 404);
    this.name = 'PaymentNotFoundError';
  }
}

/** Requested state transition is not permitted by the state machine. */
export class PaymentStateError extends PaymentError {
  constructor(currentStatus: string, requestedStatus: string) {
    super(
      `Invalid payment state transition: ${currentStatus} → ${requestedStatus}`,
      'PAYMENT_INVALID_STATE_TRANSITION',
      409
    );
    this.name = 'PaymentStateError';
  }
}

/** A payment already exists for this order or idempotency key. */
export class DuplicatePaymentError extends PaymentError {
  constructor(orderId: string) {
    super(
      `A payment already exists for order: ${orderId}`,
      'DUPLICATE_PAYMENT',
      409
    );
    this.name = 'DuplicatePaymentError';
  }
}

/**
 * The amount presented by the provider does not match the internal expected amount.
 * CRITICAL: Never mark an order paid when this error is thrown.
 */
export class AmountMismatchError extends PaymentError {
  readonly expectedMinorUnits: number;
  readonly receivedMinorUnits: number;
  readonly currency: string;

  constructor(expectedMinorUnits: number, receivedMinorUnits: number, currency: string) {
    super(
      `Payment amount mismatch: expected ${expectedMinorUnits} ${currency} minor units, received ${receivedMinorUnits}`,
      'AMOUNT_MISMATCH',
      422
    );
    this.name = 'AmountMismatchError';
    this.expectedMinorUnits = expectedMinorUnits;
    this.receivedMinorUnits = receivedMinorUnits;
    this.currency = currency;
  }
}

/** Webhook signature verification failed — do not process the event. */
export class WebhookVerificationError extends PaymentError {
  constructor(reason?: string) {
    super(
      reason ? `Webhook verification failed: ${reason}` : 'Webhook signature verification failed',
      'WEBHOOK_VERIFICATION_FAILED',
      401
    );
    this.name = 'WebhookVerificationError';
  }
}

/**
 * The requested refund would cause total refunded amount to exceed captured amount.
 * CRITICAL: Refund must be rejected when this error is thrown.
 */
export class RefundExceedsCapturableError extends PaymentError {
  readonly capturedMinorUnits: number;
  readonly alreadyRefundedMinorUnits: number;
  readonly requestedRefundMinorUnits: number;
  readonly currency: string;

  constructor(
    capturedMinorUnits: number,
    alreadyRefundedMinorUnits: number,
    requestedRefundMinorUnits: number,
    currency: string
  ) {
    super(
      `Refund of ${requestedRefundMinorUnits} ${currency} would exceed capturable amount. ` +
        `Captured: ${capturedMinorUnits}, Already refunded: ${alreadyRefundedMinorUnits}`,
      'REFUND_EXCEEDS_CAPTURABLE',
      422
    );
    this.name = 'RefundExceedsCapturableError';
    this.capturedMinorUnits = capturedMinorUnits;
    this.alreadyRefundedMinorUnits = alreadyRefundedMinorUnits;
    this.requestedRefundMinorUnits = requestedRefundMinorUnits;
    this.currency = currency;
  }
}

/** The payment provider is unavailable or returned an unexpected error. */
export class ProviderUnavailableError extends PaymentError {
  constructor(providerId: string, reason?: string) {
    super(
      reason
        ? `Payment provider "${providerId}" unavailable: ${reason}`
        : `Payment provider "${providerId}" is currently unavailable`,
      'PROVIDER_UNAVAILABLE',
      503
    );
    this.name = 'ProviderUnavailableError';
  }
}

/** The payment operation was not authorized (wrong user, wrong order). */
export class PaymentAuthorizationError extends PaymentError {
  constructor(reason?: string) {
    super(reason || 'Not authorized to perform this payment operation', 'PAYMENT_UNAUTHORIZED', 403);
    this.name = 'PaymentAuthorizationError';
  }
}

/** Capture attempted on a payment that was not in an authorized state. */
export class PaymentNotCapturableError extends PaymentError {
  constructor(currentStatus: string) {
    super(
      `Payment cannot be captured in status: ${currentStatus}`,
      'PAYMENT_NOT_CAPTURABLE',
      409
    );
    this.name = 'PaymentNotCapturableError';
  }
}

/** Currency mismatch between payment record and provider response. */
export class CurrencyMismatchError extends PaymentError {
  constructor(expectedCurrency: string, receivedCurrency: string) {
    super(
      `Currency mismatch: expected ${expectedCurrency}, received ${receivedCurrency}`,
      'CURRENCY_MISMATCH',
      422
    );
    this.name = 'CurrencyMismatchError';
  }
}

/**
 * Returns a safe, user-facing error message.
 * NEVER expose raw provider error messages to customers.
 */
export function getSafePaymentErrorMessage(error: unknown): string {
  if (error instanceof PaymentNotFoundError) return 'The requested payment could not be found.';
  if (error instanceof PaymentStateError) return 'This operation cannot be performed in the current payment state.';
  if (error instanceof DuplicatePaymentError) return 'A payment has already been initiated for this order.';
  if (error instanceof AmountMismatchError) return 'Payment amount verification failed. Please contact support.';
  if (error instanceof WebhookVerificationError) return 'Webhook authentication failed.';
  if (error instanceof RefundExceedsCapturableError) return 'Refund amount exceeds the maximum refundable amount.';
  if (error instanceof ProviderUnavailableError) return 'The payment service is temporarily unavailable. Please try again.';
  if (error instanceof PaymentAuthorizationError) return 'You are not authorized to perform this action.';
  if (error instanceof PaymentNotCapturableError) return 'This payment cannot be captured at this time.';
  if (error instanceof CurrencyMismatchError) return 'Payment currency verification failed. Please contact support.';
  if (error instanceof PaymentError) return 'A payment error occurred. Please try again or contact support.';
  return 'An unexpected error occurred. Please contact support.';
}
