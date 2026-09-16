/**
 * ==============================================================================
 * INDOPHARM — CHECKOUT DOMAIN SLICE
 * ==============================================================================
 * Multi-step checkout state machine interfaces (gateway-agnostic).
 * ==============================================================================
 */

export type CheckoutStep =
  | 'ADDRESS_CONFIRMATION'
  | 'PRESCRIPTION_ATTACHMENT'
  | 'PAYMENT_AUTHORIZATION'
  | 'ORDER_REVIEW'
  | 'SUBMITTED';

export interface CheckoutState {
  step: CheckoutStep;
  shippingAddressId?: string;
  prescriptionId?: string;
  paymentIntentId?: string;
  isReadyForSubmission: boolean;
}
