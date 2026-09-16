/**
 * ==============================================================================
 * INDOPHARM — GATEWAY-AGNOSTIC PAYMENT ABSTRACTION TYPES
 * ==============================================================================
 * IMPORTANT:
 * IndoPharm isolates all payment orchestration behind these provider-agnostic
 * interfaces. No vendor-specific SDK (Stripe, PayPal, Adyen, etc.) is allowed
 * to bleed into core domain or checkout flows.
 * ==============================================================================
 */

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
    | 'SUSPECTED_FRAUD';
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

export interface PaymentProvider {
  readonly providerId: string;
  createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntent>;
  authorizePayment(paymentIntentId: string, paymentMethodDetails?: unknown): Promise<PaymentIntent>;
  capturePayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
  cancelPaymentIntent(paymentIntentId: string, reason?: string): Promise<PaymentIntent>;
  processRefund(request: RefundRequest): Promise<RefundResult>;
  verifyWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<PaymentVerificationResult>;
}
