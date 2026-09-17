/**
 * ==============================================================================
 * INDOPHARM — PAYMENT ADAPTER FACTORY
 * ==============================================================================
 * Resolves the configured PaymentProviderAdapter by reading PAYMENT_PROVIDER
 * from the environment. The adapter is chosen at server startup — NEVER at
 * request time based on client input.
 *
 * Architecture rule:
 *   Only PaymentService should call getPaymentAdapter().
 *   Checkout, order, and frontend code must NEVER call this directly.
 *
 * Provider onboarding:
 *   1. Implement PaymentProviderAdapter interface
 *   2. Add a new case to the switch below
 *   3. Complete the provider onboarding checklist (docs/PAYMENT_PROVIDER_ONBOARDING.md)
 * ==============================================================================
 */

import type { PaymentProviderAdapter } from './types';
import { MockPaymentAdapter } from './adapters/mock/adapter';

// Legacy provider interface for backwards compatibility
export { MockPaymentAdapter as MockPaymentProvider } from './adapters/mock/adapter';
export type { PaymentProvider } from './types';

// ---------------------------------------------------------------------------
// Singleton adapter instance — initialized once per server process
// ---------------------------------------------------------------------------
let _adapterInstance: PaymentProviderAdapter | null = null;

/**
 * Returns the configured PaymentProviderAdapter singleton.
 *
 * Configuration:
 *   PAYMENT_PROVIDER=mock         → MockPaymentAdapter (dev/test only)
 *   PAYMENT_PROVIDER=checkout-com → CheckoutComAdapter (not yet implemented)
 *   (future)                      → add cases as adapters are built
 *
 * Throws in production if an unsupported or mock provider is configured.
 */
export function getPaymentAdapter(): PaymentProviderAdapter {
  if (_adapterInstance) {
    return _adapterInstance;
  }

  const provider = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase().trim();

  switch (provider) {
    case 'mock': {
      // MockPaymentAdapter constructor already throws in production
      _adapterInstance = new MockPaymentAdapter();
      break;
    }

    // Future provider integrations are added here.
    // Each must:
    //  1. Implement PaymentProviderAdapter
    //  2. Be verified as suitable for IndoPharma's pharmaceutical MCC
    //  3. Complete the provider onboarding checklist

    default: {
      throw new Error(
        `[PaymentAdapterFactory] Unsupported PAYMENT_PROVIDER: "${provider}". ` +
          'Valid options: "mock". Add new providers via the adapter interface.'
      );
    }
  }

  return _adapterInstance;
}

/**
 * @deprecated Use getPaymentAdapter() instead.
 * Kept for backwards compatibility with existing checkoutService.ts code.
 * Will be removed after checkout integration is updated.
 */
export function getPaymentProvider() {
  return getPaymentAdapter();
}

/**
 * Resets the adapter singleton — for use in tests ONLY.
 * Never call in application code.
 */
export function _resetPaymentAdapterForTesting(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[PaymentAdapterFactory] _resetPaymentAdapterForTesting cannot be called in production');
  }
  _adapterInstance = null;
}
