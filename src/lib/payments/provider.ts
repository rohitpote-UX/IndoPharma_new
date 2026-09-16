/**
 * ==============================================================================
 * INDOPHARM — PAYMENT PROVIDER FACTORY & MOCK ADAPTER
 * ==============================================================================
 * Isolates mock processing from production environments.
 * ==============================================================================
 */

import {
  PaymentProvider,
  PaymentIntent,
  RefundRequest,
  RefundResult,
  WebhookEvent,
  PaymentVerificationResult,
  CreateIntentParams,
} from './types';

/**
 * Mock development payment provider.
 * Simulates authorizations, captures, cancellations, and refunds in local dev.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly providerId = 'mock-development-gateway';
  private intents: Map<string, PaymentIntent> = new Map();

  async createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntent> {
    const intentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const intent: PaymentIntent = {
      id: intentId,
      externalId: `ext_${intentId}`,
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      status: 'REQUIRES_PAYMENT_METHOD',
      orderId: params.orderId,
      customerId: params.customerId,
      clientSecret: `mock_secret_${intentId}`,
      capturedAmount: 0,
      refundedAmount: 0,
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.intents.set(intentId, intent);
    return intent;
  }

  async authorizePayment(paymentIntentId: string): Promise<PaymentIntent> {
    const intent = this.intents.get(paymentIntentId);
    if (!intent) {
      throw new Error(`[MockPaymentProvider] PaymentIntent not found: ${paymentIntentId}`);
    }

    intent.status = 'AUTHORIZED';
    intent.updatedAt = new Date();
    this.intents.set(paymentIntentId, intent);
    return intent;
  }

  async capturePayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent> {
    const intent = this.intents.get(paymentIntentId);
    if (!intent) {
      throw new Error(`[MockPaymentProvider] PaymentIntent not found: ${paymentIntentId}`);
    }

    if (intent.status !== 'AUTHORIZED') {
      throw new Error(`[MockPaymentProvider] Cannot capture payment in status: ${intent.status}`);
    }

    intent.status = 'CAPTURED';
    intent.capturedAmount = amount ?? intent.amount;
    intent.updatedAt = new Date();
    this.intents.set(paymentIntentId, intent);
    return intent;
  }

  async cancelPaymentIntent(paymentIntentId: string, reason?: string): Promise<PaymentIntent> {
    const intent = this.intents.get(paymentIntentId);
    if (!intent) {
      throw new Error(`[MockPaymentProvider] PaymentIntent not found: ${paymentIntentId}`);
    }

    intent.status = 'CANCELED';
    intent.errorMessage = reason || 'Canceled by operator';
    intent.updatedAt = new Date();
    this.intents.set(paymentIntentId, intent);
    return intent;
  }

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    const intent = this.intents.get(request.paymentIntentId);
    if (!intent) {
      throw new Error(`[MockPaymentProvider] PaymentIntent not found: ${request.paymentIntentId}`);
    }

    const refundAmount = request.amount ?? intent.capturedAmount;
    intent.refundedAmount += refundAmount;
    if (intent.refundedAmount >= intent.capturedAmount) {
      intent.status = 'REFUNDED';
    }
    intent.updatedAt = new Date();

    return {
      refundId: `mock_ref_${Date.now()}`,
      paymentIntentId: request.paymentIntentId,
      amount: refundAmount,
      currency: intent.currency,
      status: 'SUCCEEDED',
      createdAt: new Date(),
    };
  }

  async verifyWebhook(
    rawBody: string | Buffer,
    headers: Record<string, string>
  ): Promise<PaymentVerificationResult> {
    const signature = headers['x-mock-signature'];
    if (process.env.NODE_ENV === 'production' && !signature) {
      return { isValid: false, error: 'Missing webhook signature' };
    }

    try {
      const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
      const event: WebhookEvent = {
        id: `evt_${Date.now()}`,
        provider: this.providerId,
        type: (parsed.type as string) || 'payment.authorized',
        payload: parsed,
        signature: signature || 'mock_sig',
        timestamp: new Date(),
      };
      return { isValid: true, event };
    } catch {
      return { isValid: false, error: 'Invalid webhook JSON payload' };
    }
  }
}

/**
 * Payment provider factory that resolves the configured provider adapter.
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';

  switch (provider.toLowerCase()) {
    case 'mock':
      return new MockPaymentProvider();
    default:
      console.warn(`[PaymentProvider] Unsupported provider "${provider}". Falling back to MockPaymentProvider.`);
      return new MockPaymentProvider();
  }
}
