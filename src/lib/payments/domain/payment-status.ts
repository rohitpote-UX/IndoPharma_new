/**
 * ==============================================================================
 * INDOPHARM — INTERNAL PAYMENT STATUS & STATE MACHINE
 * ==============================================================================
 * Defines the normalized payment status independent of any provider.
 * Provider-specific status strings must be mapped to this enum by the adapter.
 *
 * State Machine:
 *
 *   CREATED
 *     ├── REQUIRES_ACTION  ──► PENDING ──► AUTHORIZED
 *     ├── AUTHORIZED ──► CAPTURE_PENDING ──► CAPTURED ──► SUCCEEDED
 *     ├── PENDING ──► AUTHORIZED
 *     └── FAILED
 *
 *   AUTHORIZED
 *     └── CANCELLED  (Rx rejected, user abort before capture)
 *
 *   SUCCEEDED / CAPTURED
 *     ├── PARTIALLY_REFUNDED
 *     └── REFUNDED
 *
 *   SUCCEEDED / CAPTURED / PARTIALLY_REFUNDED
 *     └── DISPUTED ──► CHARGEBACK
 *
 *   UNKNOWN  (can move to any state after reconciliation)
 * ==============================================================================
 */

export type InternalPaymentStatus =
  | 'CREATED'
  | 'REQUIRES_ACTION'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURE_PENDING'
  | 'CAPTURED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'CHARGEBACK'
  | 'UNKNOWN';

/**
 * Allowed state transitions.
 * Key = current state; Value = set of valid next states.
 *
 * Any transition NOT listed here is PROHIBITED and must be rejected by
 * the payment service. The browser must never be able to trigger an
 * arbitrary transition.
 */
export const PAYMENT_STATE_TRANSITIONS: Record<InternalPaymentStatus, ReadonlySet<InternalPaymentStatus>> = {
  CREATED: new Set(['REQUIRES_ACTION', 'PENDING', 'AUTHORIZED', 'FAILED', 'CANCELLED', 'UNKNOWN']),
  REQUIRES_ACTION: new Set(['PENDING', 'AUTHORIZED', 'FAILED', 'CANCELLED', 'UNKNOWN']),
  PENDING: new Set(['AUTHORIZED', 'FAILED', 'CANCELLED', 'UNKNOWN']),
  AUTHORIZED: new Set(['CAPTURE_PENDING', 'CAPTURED', 'SUCCEEDED', 'CANCELLED', 'FAILED', 'UNKNOWN']),
  CAPTURE_PENDING: new Set(['CAPTURED', 'SUCCEEDED', 'FAILED', 'UNKNOWN']),
  CAPTURED: new Set(['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED', 'UNKNOWN']),
  SUCCEEDED: new Set(['PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED', 'UNKNOWN']),
  FAILED: new Set(['UNKNOWN']),           // Terminal — no recovery without new payment
  CANCELLED: new Set(['UNKNOWN']),        // Terminal
  PARTIALLY_REFUNDED: new Set(['PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED', 'UNKNOWN']),
  REFUNDED: new Set(['DISPUTED', 'UNKNOWN']),  // Can still be disputed after full refund
  DISPUTED: new Set(['CHARGEBACK', 'CAPTURED', 'SUCCEEDED', 'UNKNOWN']),  // Can resolve
  CHARGEBACK: new Set(['UNKNOWN']),       // Terminal — human intervention required
  UNKNOWN: new Set([                      // From UNKNOWN, any state is possible after reconciliation
    'CREATED', 'REQUIRES_ACTION', 'PENDING', 'AUTHORIZED',
    'CAPTURE_PENDING', 'CAPTURED', 'SUCCEEDED', 'FAILED',
    'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED', 'CHARGEBACK',
  ]),
};

/**
 * Validates whether a status transition is permitted by the state machine.
 */
export function isValidTransition(
  currentStatus: InternalPaymentStatus,
  nextStatus: InternalPaymentStatus
): boolean {
  return PAYMENT_STATE_TRANSITIONS[currentStatus]?.has(nextStatus) ?? false;
}

/**
 * Terminal states — no further provider-driven transitions are expected.
 */
export const TERMINAL_STATUSES: ReadonlySet<InternalPaymentStatus> = new Set([
  'FAILED',
  'CANCELLED',
  'CHARGEBACK',
]);

/**
 * Success states — payment has been successfully captured/settled.
 */
export const SUCCESS_STATUSES: ReadonlySet<InternalPaymentStatus> = new Set([
  'CAPTURED',
  'SUCCEEDED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
]);

/**
 * States that allow a refund to be initiated.
 */
export const REFUNDABLE_STATUSES: ReadonlySet<InternalPaymentStatus> = new Set([
  'CAPTURED',
  'SUCCEEDED',
  'PARTIALLY_REFUNDED',
]);

/**
 * States where capture is permitted.
 */
export const CAPTURABLE_STATUSES: ReadonlySet<InternalPaymentStatus> = new Set([
  'AUTHORIZED',
]);

/**
 * Returns human-readable description of a payment status.
 */
export function describePaymentStatus(status: InternalPaymentStatus): string {
  const descriptions: Record<InternalPaymentStatus, string> = {
    CREATED: 'Payment created',
    REQUIRES_ACTION: 'Action required (e.g., 3D Secure)',
    PENDING: 'Payment pending provider confirmation',
    AUTHORIZED: 'Funds authorized — awaiting capture',
    CAPTURE_PENDING: 'Capture in progress',
    CAPTURED: 'Payment captured successfully',
    SUCCEEDED: 'Payment succeeded',
    FAILED: 'Payment failed',
    CANCELLED: 'Payment cancelled',
    PARTIALLY_REFUNDED: 'Partially refunded',
    REFUNDED: 'Fully refunded',
    DISPUTED: 'Payment disputed',
    CHARGEBACK: 'Chargeback processed',
    UNKNOWN: 'Payment state unknown — under investigation',
  };
  return descriptions[status];
}
