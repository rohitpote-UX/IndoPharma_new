/**
 * ==============================================================================
 * INDOPHARM — CHECKOUT DOMAIN ENTITIES & STATE CONTRACTS
 * ==============================================================================
 * Defines the state machine, steps, session snapshots, and order submission types.
 * ==============================================================================
 */

import { EnrichedCartItem } from '@/lib/services/cartService';
import { DestinationInfo } from './eligibility';

export type CheckoutStep =
  | 'CUSTOMER_INFO'
  | 'ADDRESS'
  | 'PRESCRIPTION'
  | 'VERIFICATION'
  | 'SHIPPING'
  | 'PAYMENT'
  | 'REVIEW'
  | 'PROCESSING'
  | 'PAYMENT_PROCESSING'  // Phase 15: Payment intent created, awaiting webhook confirmation
  | 'CONFIRMED'
  | 'FAILED'
  | 'EXPIRED';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string; // State / Province
  postalCode: string;
  country: string; // "US", "IN", etc.
}

export interface PrescriptionSubmission {
  prescriberName: string;
  prescriberState?: string;
  prescriberNpi?: string;
  fileName?: string;
  fileSizeBytes?: number;
  documentRef?: string;
  patientConfirmation: boolean;
}

export interface ShippingMethodOption {
  id: string;
  name: string;
  estimatedDays: string;
  carrier: string;
  priceUsd: number;
  description: string;
  isColdChainMonitored: boolean;
}

export interface PaymentMethodSelection {
  providerId: string;
  type: 'CREDIT_DEBIT_CARD' | 'HSA_FSA' | 'MOCK_GATEWAY';
  cardholderName?: string;
  last4?: string;
  expiry?: string;
}

export interface CheckoutSessionData {
  id: string;
  cartId: string;
  sessionToken: string;
  status: CheckoutStep;
  currency: string;
  destination: DestinationInfo;
  items: EnrichedCartItem[];
  subtotalUsd: number;
  shippingUsd: number;
  estimatedTaxUsd: number;
  totalUsd: number;
  totalSavingsUsd?: number;
  customerInfo?: CustomerInfo;
  shippingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethodOption;
  prescription?: PrescriptionSubmission;
  paymentMethod?: PaymentMethodSelection;
  requiresPrescription: boolean;
  requiresVerification: boolean;
  idempotencyKey: string;
  expiresAt: string;
  orderId?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderConfirmationResult {
  orderId: string;
  orderNumber: string;
  totalUsd: number;
  currency: string;
  itemsCount: number;
  destinationCountry: string;
  shippingAddress: ShippingAddress;
  estimatedDeliveryDays: string;
  requiresPrescriptionReview: boolean;
  placedAt: string;
  // Phase 15: Payment fields
  paymentId?: string;                  // Internal PaymentService payment ID
  paymentStatus?: string;              // InternalPaymentStatus
  providerClientToken?: string | null; // Safe token for payment UI (NOT a secret key)
}
