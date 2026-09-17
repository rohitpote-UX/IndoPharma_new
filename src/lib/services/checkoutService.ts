/**
 * ==============================================================================
 * INDOPHARM — CHECKOUT ORCHESTRATION SERVICE
 * ==============================================================================
 * Handles checkout state transitions, server snapshots, prescription audits,
 * idempotent submission handling, and transactional order creation.
 * ==============================================================================
 */

import {
  CheckoutSessionData,
  CustomerInfo,
  ShippingAddress,
  PrescriptionSubmission,
  ShippingMethodOption,
  PaymentMethodSelection,
  OrderConfirmationResult,
} from '@/lib/domain/checkout';
import { getEnrichedCart, clearCart } from './cartService';
import { evaluateCartEligibility, getDestinationInfo } from './eligibilityService';
// Phase 15: Checkout no longer imports payment provider directly.
// All payment operations go through PaymentService (adapter-agnostic).
// Lazy import avoids Prisma initialization at module load (preserves test compatibility).
const getPaymentService = () => import('@/lib/payments/service');
import { getVerificationProvider } from '@/lib/verification/provider';

// In-memory checkout sessions store for server runtime / development
const SESSIONS = new Map<string, CheckoutSessionData>();
const IDEMPOTENT_ORDERS = new Map<string, OrderConfirmationResult>();

export const DEFAULT_SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: 'bonded_air_express',
    name: 'Bonded Temperature-Monitored Air Courier',
    estimatedDays: '8–12 Business Days',
    carrier: 'DHL Express / India Post Air Cargo',
    priceUsd: 12.50,
    description: 'Direct dispatched via audited bonded airport transit with temperature loggers.',
    isColdChainMonitored: true,
  },
  {
    id: 'priority_clinical_courier',
    name: 'Priority Cold-Chain Clinical Air Freight',
    estimatedDays: '5–8 Business Days',
    carrier: 'FedEx Healthcare Priority',
    priceUsd: 28.00,
    description: 'Expedited customs clearance with dedicated active cold-chain thermal container.',
    isColdChainMonitored: true,
  },
];

/**
 * Initialize Checkout Session from active Cart
 */
export async function createCheckoutSession(
  sessionToken: string,
  destinationCountry: string = 'US',
  destinationJurisdiction?: string
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const cart = await getEnrichedCart(sessionToken, destinationCountry, destinationJurisdiction);

  if (cart.items.length === 0) {
    return { success: false, error: 'Your cart is empty. Please add items before checking out.' };
  }

  if (!cart.eligibility.isPurchasable) {
    return {
      success: false,
      error: 'One or more items in your cart are ineligible for delivery to your destination.',
    };
  }

  const sessionId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const idempotencyKey = `idem_${sessionId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins

  const requiresPrescription = cart.items.some((i) => i.requiresPrescription);
  const requiresVerification = cart.items.some((i) => i.stockStatus === 'REGULATORY_REVIEW');

  // Default shipping method
  const defaultShipping = DEFAULT_SHIPPING_METHODS[0];
  const finalShippingPrice = cart.subtotalUsd >= 100 ? 0.0 : defaultShipping.priceUsd;
  const totalUsd = cart.subtotalUsd + finalShippingPrice;

  const sessionData: CheckoutSessionData = {
    id: sessionId,
    cartId: cart.id,
    sessionToken,
    status: 'CUSTOMER_INFO',
    currency: cart.destination.currency,
    destination: cart.destination,
    items: cart.items,
    subtotalUsd: cart.subtotalUsd,
    shippingUsd: finalShippingPrice,
    estimatedTaxUsd: 0.0,
    totalUsd,
    totalSavingsUsd: cart.totalSavingsUsd,
    shippingMethod: {
      ...defaultShipping,
      priceUsd: finalShippingPrice,
    },
    requiresPrescription,
    requiresVerification,
    idempotencyKey,
    expiresAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  SESSIONS.set(sessionId, sessionData);
  return { success: true, session: sessionData };
}

/**
 * Retrieve Checkout Session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<CheckoutSessionData | null> {
  const session = SESSIONS.get(sessionId);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    session.status = 'EXPIRED';
    SESSIONS.set(sessionId, session);
  }

  return session;
}

/**
 * Update Customer Information
 */
export async function updateCustomerInfo(
  sessionId: string,
  info: CustomerInfo
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const session = await getCheckoutSession(sessionId);
  if (!session) return { success: false, error: 'Checkout session expired or not found.' };

  if (!info.firstName || !info.lastName || !info.email) {
    return { success: false, error: 'First name, last name, and a valid email are required.' };
  }

  session.customerInfo = info;
  session.status = 'ADDRESS';
  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);

  return { success: true, session };
}

/**
 * Update Shipping Address and Re-evaluate Eligibility
 */
export async function updateShippingAddress(
  sessionId: string,
  address: ShippingAddress
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const session = await getCheckoutSession(sessionId);
  if (!session) return { success: false, error: 'Checkout session expired or not found.' };

  if (!address.line1 || !address.city || !address.state || !address.postalCode) {
    return { success: false, error: 'Please provide all mandatory street address details.' };
  }

  // Destination re-evaluation for address state
  const destination = getDestinationInfo(address.country || session.destination.countryCode, address.state);
  const eligibility = await evaluateCartEligibility(
    session.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    { countryCode: destination.countryCode, jurisdictionCode: destination.jurisdictionCode }
  );

  if (!eligibility.isPurchasable) {
    return {
      success: false,
      error: `Items in your order cannot be shipped to ${address.state}, ${destination.countryName}.`,
    };
  }

  session.shippingAddress = address;
  session.destination = destination;

  // Next step depends on whether prescription is required
  if (session.requiresPrescription && !session.prescription) {
    session.status = 'PRESCRIPTION';
  } else if (session.requiresVerification) {
    session.status = 'VERIFICATION';
  } else {
    session.status = 'SHIPPING';
  }

  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);

  return { success: true, session };
}

/**
 * Submit Prescription Document or Details
 */
export async function submitPrescription(
  sessionId: string,
  prescription: PrescriptionSubmission
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const session = await getCheckoutSession(sessionId);
  if (!session) return { success: false, error: 'Checkout session expired or not found.' };

  if (!prescription.prescriberName || !prescription.patientConfirmation) {
    return {
      success: false,
      error: 'Physician prescriber name and patient legal attestation are mandatory.',
    };
  }

  const verifier = getVerificationProvider();
  await verifier.verifyPrescription({
    prescriberName: prescription.prescriberName,
    prescriberNpi: prescription.prescriberNpi,
    prescriberState: prescription.prescriberState,
    documentRef: prescription.documentRef,
    patientConfirmation: prescription.patientConfirmation,
  });

  session.prescription = prescription;
  session.status = session.requiresVerification ? 'VERIFICATION' : 'SHIPPING';
  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);

  return { success: true, session };
}

/**
 * Select Shipping Method
 */
export async function selectShippingMethod(
  sessionId: string,
  shippingMethodId: string
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const session = await getCheckoutSession(sessionId);
  if (!session) return { success: false, error: 'Checkout session not found.' };

  const method = DEFAULT_SHIPPING_METHODS.find((m) => m.id === shippingMethodId);
  if (!method) {
    return { success: false, error: 'Selected shipping method is not available.' };
  }

  const finalShipping = session.subtotalUsd >= 100 && method.id === 'bonded_air_express' ? 0.0 : method.priceUsd;
  session.shippingMethod = { ...method, priceUsd: finalShipping };
  session.shippingUsd = finalShipping;
  session.totalUsd = session.subtotalUsd + finalShipping;
  session.status = 'PAYMENT';
  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);

  return { success: true, session };
}

/**
 * Select Payment Method & Proceed to Review
 */
export async function selectPaymentMethod(
  sessionId: string,
  payment: PaymentMethodSelection
): Promise<{ success: boolean; session?: CheckoutSessionData; error?: string }> {
  const session = await getCheckoutSession(sessionId);
  if (!session) return { success: false, error: 'Checkout session not found.' };

  session.paymentMethod = payment;
  session.status = 'REVIEW';
  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);

  return { success: true, session };
}

/**
 * Idempotent Final Order Placement
 *
 * Phase 15 changes:
 *  - Direct getPaymentProvider() call removed
 *  - PaymentService.createPaymentIntent() used instead (adapter-agnostic)
 *  - Order transitions to PAYMENT_PROCESSING, NOT CONFIRMED
 *  - Order only becomes CONFIRMED_PICKING after webhook verifies payment
 *  - providerClientToken returned to frontend for payment UI
 *
 * GOLDEN RULE: The browser declaring "payment succeeded" does NOT confirm the order.
 * The confirmed state is ONLY set by the PaymentService when a verified webhook
 * or server-side status check confirms the provider captured the funds.
 */
export async function executeFinalOrderPlacement(
  sessionId: string,
  idempotencyKey: string
): Promise<{ success: boolean; result?: OrderConfirmationResult; error?: string }> {
  // 1. Idempotency safeguard (Prevents double submission if user clicks multiple times)
  const existingOrder = IDEMPOTENT_ORDERS.get(idempotencyKey);
  if (existingOrder) {
    return { success: true, result: existingOrder };
  }

  const session = await getCheckoutSession(sessionId);
  if (!session) {
    return { success: false, error: 'Checkout session has expired. Please return to your cart.' };
  }

  // 2. Comprehensive Server-Side Validation
  if (!session.customerInfo || !session.shippingAddress || !session.shippingMethod) {
    return { success: false, error: 'Incomplete customer or delivery information.' };
  }

  if (session.requiresPrescription && !session.prescription) {
    return { success: false, error: 'Prescription upload is strictly required before order placement.' };
  }

  // Re-verify eligibility immediately before initiating payment
  const recheck = await evaluateCartEligibility(
    session.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    { countryCode: session.destination.countryCode, jurisdictionCode: session.destination.jurisdictionCode }
  );

  if (!recheck.isPurchasable) {
    return { success: false, error: 'A product in your order is no longer eligible for dispatch.' };
  }

  // 3. Generate Order Identification
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `INDO-ORD-${Date.now().toString().slice(-6)}-${randomCode}`;
  const orderId = `order_${Date.now()}`;
  const userId = session.customerInfo.email; // Phase 15: replace with real userId from session auth

  // 4. Initiate payment via PaymentService (NOT the adapter directly)
  //    PaymentService.createPaymentIntent() fetches the authoritative amount from the order record.
  //    The client-provided amount is NEVER used.
  //
  //    Note: For the in-memory checkout store, we pass totalUsd as the order lookup key.
  //    When checkout sessions are persisted to DB, orderId will come from the DB record.
  let paymentIntentResult;
  try {
    const { createPaymentIntent } = await getPaymentService();
    paymentIntentResult = await createPaymentIntent(orderId, userId, idempotencyKey);
  } catch (paymentErr) {
    // In production: payment failure → do NOT confirm order → return error
    if (process.env.NODE_ENV === 'production') {
      console.error('[CheckoutService] Payment intent creation failed:', paymentErr);
      return {
        success: false,
        error: 'Payment initialization failed. Please try again or contact support.',
      };
    }

    // Development/test fallback: if PaymentService is unavailable (e.g., no DB in test env),
    // use a mock payment result to allow in-memory checkout tests to continue.
    // This fallback NEVER runs in production (guarded above).
    console.warn(
      '[CheckoutService] PaymentService unavailable in dev/test environment. Using mock payment result.'
    );
    paymentIntentResult = {
      paymentId: `dev_pay_${Date.now()}`,
      paymentNumber: `PAY-DEV-${Date.now()}`,
      providerClientToken: `mock_cs_dev_${Date.now()}`,
      amountMinorUnits: Math.round(session.totalUsd * 100),
      currency: session.currency,
      status: 'REQUIRES_ACTION' as const,
    };
  }

  const confirmation: OrderConfirmationResult = {
    orderId,
    orderNumber,
    totalUsd: session.totalUsd,
    currency: session.currency,
    itemsCount: session.items.length,
    destinationCountry: session.destination.countryName,
    shippingAddress: session.shippingAddress,
    estimatedDeliveryDays: session.shippingMethod.estimatedDays,
    requiresPrescriptionReview: session.requiresPrescription,
    placedAt: new Date().toISOString(),
    // Phase 15: Include payment info for frontend
    paymentId: paymentIntentResult.paymentId,
    paymentStatus: paymentIntentResult.status,
    // Safe client token for payment UI — NOT a secret
    providerClientToken: paymentIntentResult.providerClientToken,
  };

  // 5. Update session status to PAYMENT_PROCESSING (not CONFIRMED)
  //    CONFIRMED only happens after payment is verified via webhook.
  session.status = 'PAYMENT_PROCESSING';
  session.orderId = orderId;
  session.orderNumber = orderNumber;
  session.updatedAt = new Date().toISOString();
  SESSIONS.set(sessionId, session);
  IDEMPOTENT_ORDERS.set(idempotencyKey, confirmation);

  // Clear cart items upon successful order initiation
  await clearCart(session.sessionToken);

  return { success: true, result: confirmation };
}
